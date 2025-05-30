import React, { useState, useEffect, useCallback } from "react";
import { RiAddLine, RiEdit2Line, RiDeleteBinLine } from "react-icons/ri";
import Sidebar from "../common/admin/AdminSidebar";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  createOfferAction,
  getAllOffersAction,
  editOfferAction,
  deleteOfferAction,
} from "@/redux/actions/offerActions";
import { getAllCategoriesAction } from "@/redux/actions/categoryActions";
import ConfirmationModal from "../common/ConfirmationModal";
import Pagination from "../common/Pagination";
import { toast } from "react-toastify";

export interface Offer {
  _id: string;
  discountPercentage: number;
  expirationDate: string;
  categoryId: {
    _id: string;
    categoryName: string;
    isActive: boolean;
  };
}

interface Category {
  _id: string;
  categoryName: string;
  isActive: boolean;
}

interface OfferFormValues {
  discountPercentage: number | "";
  expirationDate: string;
  categoryId: string;
}

const addOfferValidationSchema = Yup.object({
  discountPercentage: Yup.number()
    .required("Discount percentage is required")
    .min(1, "Discount percentage must be greater than 0")
    .max(100, "Discount percentage cannot exceed 100"),
  expirationDate: Yup.date()
    .required("Expiration date is required")
    .typeError("Invalid date format")
    .min(new Date(), "Expiration date must be in the future"),
  categoryId: Yup.string().required("Category is required"),
});

const editOfferValidationSchema = Yup.object({
  discountPercentage: Yup.number()
    .required("Discount percentage is required")
    .min(1, "Discount percentage must be greater than 0")
    .max(100, "Discount percentage cannot exceed 100"),
  expirationDate: Yup.date()
    .required("Expiration date is required")
    .typeError("Invalid date format")
    .min(new Date(), "Expiration date must be in the future"),
  categoryId: Yup.string().required("Category is required"),
});

const OffersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [offers, setOffers] = useState<Offer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOffers, setTotalOffers] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(
    () => () => {}
  );
  const [confirmMessage, setConfirmMessage] = useState("");
  const [limit] = useState(10);

  const today = new Date().toISOString().split("T")[0];

  const fetchCategories = useCallback(async () => {
    try {
      const result = await dispatch(
        getAllCategoriesAction({ page: 1, limit: 100 })
      ).unwrap();
      setCategories(result.categories.filter((category: Category) => category.isActive));
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch categories";
      toast.error(errorMessage);
    }
  }, [dispatch]);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(
        getAllOffersAction({ page: currentPage, limit })
      ).unwrap();
      setOffers(result.offers);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalOffers(result.totalOffers);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch offers";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, currentPage, limit]);

  useEffect(() => {
    fetchCategories();
    fetchOffers();
  }, [fetchCategories, fetchOffers]);

  const addOfferFormik = useFormik<OfferFormValues>({
    initialValues: {
      discountPercentage: "",
      expirationDate: "",
      categoryId: "",
    },
    validationSchema: addOfferValidationSchema,
    onSubmit: (values, { resetForm }: FormikHelpers<OfferFormValues>) => {
      setConfirmMessage("Are you sure you want to create this offer?");
      setConfirmAction(() => async () => {
        try {
          const submissionValues = {
            ...values,
            discountPercentage: Number(values.discountPercentage),
          };
          await dispatch(createOfferAction(submissionValues)).unwrap();
          toast.success("Offer created successfully");
          setIsAddModalOpen(false);
          resetForm();
          await fetchOffers();
        } catch (err: any) {
          const errorMessage = err.message || "Failed to create offer";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      });
      setIsConfirmModalOpen(true);
    },
  });

  const editOfferFormik = useFormik<OfferFormValues>({
    initialValues: {
      discountPercentage: selectedOffer?.discountPercentage || "",
      expirationDate: selectedOffer?.expirationDate || "",
      categoryId: selectedOffer?.categoryId._id || "",
    },
    validationSchema: editOfferValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (selectedOffer) {
        setConfirmMessage("Are you sure you want to update this offer?");
        setConfirmAction(() => async () => {
          try {
            const submissionValues = {
              ...values,
              discountPercentage: Number(values.discountPercentage),
            };
            await dispatch(
              editOfferAction({
                offerId: selectedOffer._id,
                ...submissionValues,
              })
            ).unwrap();
            toast.success("Offer updated successfully");
            setIsEditModalOpen(false);
            await fetchOffers();
          } catch (err: any) {
            const errorMessage = err.message || "Failed to update offer";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        });
        setIsConfirmModalOpen(true);
      }
    },
  });

  const handleDeleteOffer = (offerId: string, categoryName: string) => {
    setConfirmMessage(`Are you sure you want to delete the offer for "${categoryName}"?`);
    setConfirmAction(() => async () => {
      try {
        await dispatch(deleteOfferAction(offerId)).unwrap();
        toast.success("Offer deleted successfully");
        const remainingOffersOnPage = offers.filter(
          (offer) => offer._id !== offerId
        ).length;
        if (remainingOffersOnPage === 0 && currentPage > 1) {
          setCurrentPage((prev) => Math.max(1, prev - 1));
        } else {
          await fetchOffers();
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to delete offer";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
    setIsConfirmModalOpen(true);
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Offers</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#49bbbd] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3a9a9b] transition-colors duration-200"
            >
              <RiAddLine size={20} />
              Add Offer
            </button>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-100 rounded-t-lg">
              {error}
            </div>
          )}
          <div className="p-4 text-sm text-gray-600">
            Total Offers: {totalOffers}
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500 flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 mr-3 text-[#49bbbd]"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Loading...
            </div>
          ) : offers.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No offers found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Discount (%)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {offers
                    .filter((offer) => offer && offer._id)
                    .map((offer) => (
                      <tr key={offer._id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {offer.categoryId.categoryName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {offer.discountPercentage}%
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(offer.expirationDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedOffer(offer);
                                setIsEditModalOpen(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                              title="Edit Offer"
                            >
                              <RiEdit2Line size={20} />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteOffer(
                                  offer._id,
                                  offer.categoryId.categoryName
                                )
                              }
                              className="text-red-600 hover:text-red-800 transition-colors duration-150"
                              title="Delete Offer"
                            >
                              <RiDeleteBinLine size={20} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Add Offer
              </h2>
              <form onSubmit={addOfferFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={addOfferFormik.values.categoryId}
                    onChange={addOfferFormik.handleChange}
                    onBlur={addOfferFormik.handleBlur}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addOfferFormik.touched.categoryId &&
                      addOfferFormik.errors.categoryId
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {addOfferFormik.touched.categoryId &&
                    addOfferFormik.errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addOfferFormik.errors.categoryId === "string"
                          ? addOfferFormik.errors.categoryId
                          : "Invalid category"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={addOfferFormik.values.discountPercentage}
                    onChange={addOfferFormik.handleChange}
                    onBlur={addOfferFormik.handleBlur}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addOfferFormik.touched.discountPercentage &&
                      addOfferFormik.errors.discountPercentage
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter percentage (1-100)"
                  />
                  {addOfferFormik.touched.discountPercentage &&
                    addOfferFormik.errors.discountPercentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addOfferFormik.errors.discountPercentage ===
                        "string"
                          ? addOfferFormik.errors.discountPercentage
                          : "Invalid discount percentage"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={addOfferFormik.values.expirationDate}
                    onChange={addOfferFormik.handleChange}
                    onBlur={addOfferFormik.handleBlur}
                    min={today}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addOfferFormik.touched.expirationDate &&
                      addOfferFormik.errors.expirationDate
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Select expiration date"
                  />
                  {addOfferFormik.touched.expirationDate &&
                    addOfferFormik.errors.expirationDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addOfferFormik.errors.expirationDate ===
                        "string"
                          ? addOfferFormik.errors.expirationDate
                          : "Invalid expiration date"}
                      </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !addOfferFormik.isValid || addOfferFormik.isSubmitting
                    }
                    className={`px-4 py-2 rounded-lg text-white transition-colors duration-150 ${
                      !addOfferFormik.isValid || addOfferFormik.isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#49bbbd] hover:bg-[#3a9a9b]"
                    }`}
                  >
                    Add Offer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isEditModalOpen && selectedOffer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Edit Offer
              </h2>
              <form onSubmit={editOfferFormik.handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={editOfferFormik.values.categoryId}
                    onChange={editOfferFormik.handleChange}
                    onBlur={editOfferFormik.handleBlur}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editOfferFormik.touched.categoryId &&
                      editOfferFormik.errors.categoryId
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                  {editOfferFormik.touched.categoryId &&
                    editOfferFormik.errors.categoryId && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editOfferFormik.errors.categoryId === "string"
                          ? editOfferFormik.errors.categoryId
                          : "Invalid category"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Discount Percentage
                  </label>
                  <input
                    type="number"
                    name="discountPercentage"
                    value={editOfferFormik.values.discountPercentage}
                    onChange={editOfferFormik.handleChange}
                    onBlur={editOfferFormik.handleBlur}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editOfferFormik.touched.discountPercentage &&
                      editOfferFormik.errors.discountPercentage
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter percentage (1-100)"
                  />
                  {editOfferFormik.touched.discountPercentage &&
                    editOfferFormik.errors.discountPercentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editOfferFormik.errors.discountPercentage ===
                        "string"
                          ? editOfferFormik.errors.discountPercentage
                          : "Invalid discount percentage"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={editOfferFormik.values.expirationDate}
                    onChange={editOfferFormik.handleChange}
                    onBlur={editOfferFormik.handleBlur}
                    min={today}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editOfferFormik.touched.expirationDate &&
                      editOfferFormik.errors.expirationDate
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Select expiration date"
                  />
                  {editOfferFormik.touched.expirationDate &&
                    editOfferFormik.errors.expirationDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editOfferFormik.errors.expirationDate ===
                        "string"
                          ? editOfferFormik.errors.expirationDate
                          : "Invalid expiration date"}
                      </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !editOfferFormik.isValid ||
                      editOfferFormik.isSubmitting ||
                      editOfferFormik.isValidating ||
                      !editOfferFormik.dirty
                    }
                    className={`px-4 py-2 rounded-lg text-white transition-colors duration-150 ${
                      !editOfferFormik.isValid ||
                      editOfferFormik.isSubmitting ||
                      editOfferFormik.isValidating ||
                      !editOfferFormik.dirty
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#49bbbd] hover:bg-[#3a9a9b]"
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        <ConfirmationModal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={() => {
            confirmAction();
            setIsConfirmModalOpen(false);
          }}
          message={confirmMessage}
        />
      </div>
    </div>
  );
};

export default OffersPage;