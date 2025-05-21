import React, { useState, useEffect, useCallback } from "react";
import { RiAddLine, RiEdit2Line, RiDeleteBinLine } from "react-icons/ri";
import Sidebar from "../common/admin/AdminSidebar";
import { useFormik, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import {
  createCouponAction,
  getAllCouponsAction,
  editCouponAction,
  deleteCouponAction,
} from "@/redux/actions/couponActions";
import ConfirmationModal from "../common/ConfirmationModal";
import Pagination from "../common/Pagination";
import { toast } from "react-toastify";

export interface Coupon {
  _id: string;
  code: string;
  discountPercentage: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  expirationDate: string;
  isActive: boolean;
}

interface CouponFormValues {
  code: string;
  discountPercentage: number | "";
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  expirationDate: string;
  isActive: boolean;
}

const addCouponValidationSchema = Yup.object({
  code: Yup.string().required("Coupon code is required").uppercase().trim(),
  discountPercentage: Yup.number()
    .required("Discount percentage is required")
    .min(1, "Discount percentage must be greater than 0")
    .max(100, "Discount percentage cannot exceed 100"),
  maxDiscountAmount: Yup.number()
    .required("Max discount amount is required")
    .min(0, "Max discount amount cannot be negative"),
  minPurchaseAmount: Yup.number()
    .required("Min purchase amount is required")
    .min(0, "Min purchase amount cannot be negative"),
  expirationDate: Yup.date()
    .required("Expiration date is required")
    .typeError("Invalid date format")
    .min(new Date(), "Expiration date must be in the future"),
  isActive: Yup.boolean(),
});

const editCouponValidationSchema = Yup.object({
  code: Yup.string().required("Coupon code is required").uppercase().trim(),
  discountPercentage: Yup.number()
    .required("Discount percentage is required")
    .min(1, "Discount percentage must be greater than 0")
    .max(100, "Discount percentage cannot exceed 100"),
  maxDiscountAmount: Yup.number()
    .min(0, "Max discount amount cannot be negative")
    .nullable(),
  minPurchaseAmount: Yup.number()
    .min(0, "Min purchase amount cannot be negative")
    .nullable(),
  expirationDate: Yup.date()
    .required("Expiration date is required")
    .typeError("Invalid date format")
    .min(new Date(), "Expiration date must be in the future"),
  isActive: Yup.boolean().required("Status is required"),
});

const CouponsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCoupons, setTotalCoupons] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(
    () => () => {}
  );
  const [confirmMessage, setConfirmMessage] = useState("");
  const [limit] = useState(10);

  const today = new Date().toISOString().split("T")[0];

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await dispatch(
        getAllCouponsAction({ page: currentPage, limit })
      ).unwrap();
      setCoupons(result.coupons);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalCoupons(result.totalCoupons);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to fetch coupons";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dispatch, currentPage, limit]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const addCouponFormik = useFormik<CouponFormValues>({
    initialValues: {
      code: "",
      discountPercentage: "",
      maxDiscountAmount: undefined,
      minPurchaseAmount: undefined,
      expirationDate: "",
      isActive: true,
    },
    validationSchema: addCouponValidationSchema,
    onSubmit: (values, { resetForm }: FormikHelpers<CouponFormValues>) => {
      setConfirmMessage("Are you sure you want to create this coupon?");
      setConfirmAction(() => async () => {
        try {
          const submissionValues = {
            ...values,
            discountPercentage: Number(values.discountPercentage),
          };
          await dispatch(createCouponAction(submissionValues)).unwrap();
          toast.success("Coupon created successfully");
          setIsAddModalOpen(false);
          resetForm();
          await fetchCoupons();
        } catch (err: any) {
          const errorMessage = err.message || "Failed to create coupon";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      });
      setIsConfirmModalOpen(true);
    },
  });

  const editCouponFormik = useFormik<CouponFormValues>({
    initialValues: {
      code: selectedCoupon?.code || "",
      discountPercentage: selectedCoupon?.discountPercentage || "",
      maxDiscountAmount: selectedCoupon?.maxDiscountAmount,
      minPurchaseAmount: selectedCoupon?.minPurchaseAmount,
      expirationDate: selectedCoupon?.expirationDate || "",
      isActive: selectedCoupon?.isActive ?? true,
    },
    validationSchema: editCouponValidationSchema,
    enableReinitialize: true,
    onSubmit: (values) => {
      if (selectedCoupon) {
        setConfirmMessage("Are you sure you want to update this coupon?");
        setConfirmAction(() => async () => {
          try {
            const submissionValues = {
              ...values,
              discountPercentage: Number(values.discountPercentage),
            };
            await dispatch(
              editCouponAction({
                couponId: selectedCoupon._id,
                ...submissionValues,
              })
            ).unwrap();
            toast.success("Coupon updated successfully");
            setIsEditModalOpen(false);
            await fetchCoupons();
          } catch (err: any) {
            const errorMessage = err.message || "Failed to update coupon";
            setError(errorMessage);
            toast.error(errorMessage);
          }
        });
        setIsConfirmModalOpen(true);
      }
    },
  });

  const handleDeleteCoupon = (couponId: string, code: string) => {
    console.log("Deleting coupon with ID:", couponId);
    setConfirmMessage(`Are you sure you want to delete the coupon "${code}"?`);
    setConfirmAction(() => async () => {
      try {
        await dispatch(deleteCouponAction(couponId)).unwrap();
        toast.success("Coupon deleted successfully");
        const remainingCouponsOnPage = coupons.filter(
          (coupon) => coupon._id !== couponId
        ).length;
        if (remainingCouponsOnPage === 0 && currentPage > 1) {
          setCurrentPage((prev) => Math.max(1, prev - 1));
        } else {
          await fetchCoupons();
        }
      } catch (err: any) {
        const errorMessage = err.message || "Failed to delete coupon";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    });
    setIsConfirmModalOpen(true);
  };

  // Handle Pagination
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Coupons</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-[#49bbbd] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#3a9a9b] transition-colors"
            >
              <RiAddLine size={20} />
              Add Coupon
            </button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-100 rounded-t-lg">
              {error}
            </div>
          )}
          <div className="p-4 text-sm text-gray-600">
            Total Coupons: {totalCoupons}
          </div>
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : coupons.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No coupons found
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Discount (%)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Max Discount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Min Purchase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {coupons
                  .filter((coupon) => coupon && coupon._id)
                  .map((coupon) => (
                    <tr key={coupon._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {coupon.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.discountPercentage}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.maxDiscountAmount
                          ? `$${coupon.maxDiscountAmount}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {coupon.minPurchaseAmount
                          ? `$${coupon.minPurchaseAmount}`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(coupon.expirationDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            coupon.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {coupon.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedCoupon(coupon);
                            setIsEditModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 mr-4"
                        >
                          <RiEdit2Line size={20} />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteCoupon(coupon._id, coupon.code)
                          }
                          className="text-red-600 hover:text-red-800"
                        >
                          <RiDeleteBinLine size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
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
                Add Coupon
              </h2>
              <form
                onSubmit={addCouponFormik.handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={addCouponFormik.values.code}
                    onChange={addCouponFormik.handleChange}
                    onBlur={addCouponFormik.handleBlur}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addCouponFormik.touched.code &&
                      addCouponFormik.errors.code
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter coupon code"
                  />
                  {addCouponFormik.touched.code &&
                    addCouponFormik.errors.code && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.code === "string"
                          ? addCouponFormik.errors.code
                          : "Invalid coupon code"}
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
                    value={addCouponFormik.values.discountPercentage}
                    onChange={addCouponFormik.handleChange}
                    onBlur={addCouponFormik.handleBlur}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addCouponFormik.touched.discountPercentage &&
                      addCouponFormik.errors.discountPercentage
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter percentage (1-100)"
                  />
                  {addCouponFormik.touched.discountPercentage &&
                    addCouponFormik.errors.discountPercentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.discountPercentage ===
                        "string"
                          ? addCouponFormik.errors.discountPercentage
                          : "Invalid discount percentage"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Discount Amount
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={addCouponFormik.values.maxDiscountAmount || ""}
                    onChange={addCouponFormik.handleChange}
                    onBlur={addCouponFormik.handleBlur}
                    min="0"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addCouponFormik.touched.maxDiscountAmount &&
                      addCouponFormik.errors.maxDiscountAmount
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter max discount amount"
                  />
                  {addCouponFormik.touched.maxDiscountAmount &&
                    addCouponFormik.errors.maxDiscountAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.maxDiscountAmount ===
                        "string"
                          ? addCouponFormik.errors.maxDiscountAmount
                          : "Invalid max discount amount"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Purchase Amount
                  </label>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    value={addCouponFormik.values.minPurchaseAmount || ""}
                    onChange={addCouponFormik.handleChange}
                    onBlur={addCouponFormik.handleBlur}
                    min="0"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addCouponFormik.touched.minPurchaseAmount &&
                      addCouponFormik.errors.minPurchaseAmount
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter min purchase amount"
                  />
                  {addCouponFormik.touched.minPurchaseAmount &&
                    addCouponFormik.errors.minPurchaseAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.minPurchaseAmount ===
                        "string"
                          ? addCouponFormik.errors.minPurchaseAmount
                          : "Invalid min purchase amount"}
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
                    value={addCouponFormik.values.expirationDate}
                    onChange={addCouponFormik.handleChange}
                    onBlur={addCouponFormik.handleBlur}
                    min={today}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addCouponFormik.touched.expirationDate &&
                      addCouponFormik.errors.expirationDate
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Select expiration date"
                  />
                  {addCouponFormik.touched.expirationDate &&
                    addCouponFormik.errors.expirationDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.expirationDate ===
                        "string"
                          ? addCouponFormik.errors.expirationDate
                          : "Invalid expiration date"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="isActive"
                    value={addCouponFormik.values.isActive.toString()}
                    onChange={addCouponFormik.handleChange}
                    onBlur={addCouponFormik.handleBlur}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      addCouponFormik.touched.isActive &&
                      addCouponFormik.errors.isActive
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {addCouponFormik.touched.isActive &&
                    addCouponFormik.errors.isActive && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.isActive === "string"
                          ? addCouponFormik.errors.isActive
                          : "Invalid status"}
                      </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !addCouponFormik.isValid || addCouponFormik.isSubmitting
                    }
                    className={`px-4 py-2 rounded-lg text-white ${
                      !addCouponFormik.isValid || addCouponFormik.isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#49bbbd] hover:bg-[#3a9a9b]"
                    }`}
                  >
                    Add Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {isEditModalOpen && selectedCoupon && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                Edit Coupon
              </h2>
              <form
                onSubmit={editCouponFormik.handleSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Coupon Code
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={editCouponFormik.values.code}
                    onChange={editCouponFormik.handleChange}
                    onBlur={editCouponFormik.handleBlur}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editCouponFormik.touched.code &&
                      editCouponFormik.errors.code
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter coupon code"
                  />
                  {editCouponFormik.touched.code &&
                    editCouponFormik.errors.code && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editCouponFormik.errors.code === "string"
                          ? editCouponFormik.errors.code
                          : "Invalid coupon code"}
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
                    value={editCouponFormik.values.discountPercentage}
                    onChange={editCouponFormik.handleChange}
                    onBlur={editCouponFormik.handleBlur}
                    min="1"
                    max="100"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editCouponFormik.touched.discountPercentage &&
                      editCouponFormik.errors.discountPercentage
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter percentage (1-100)"
                  />
                  {editCouponFormik.touched.discountPercentage &&
                    editCouponFormik.errors.discountPercentage && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editCouponFormik.errors.discountPercentage ===
                        "string"
                          ? editCouponFormik.errors.discountPercentage
                          : "Invalid discount percentage"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Max Discount Amount
                  </label>
                  <input
                    type="number"
                    name="maxDiscountAmount"
                    value={editCouponFormik.values.maxDiscountAmount || ""}
                    onChange={editCouponFormik.handleChange}
                    onBlur={editCouponFormik.handleBlur}
                    min="0"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editCouponFormik.touched.maxDiscountAmount &&
                      editCouponFormik.errors.maxDiscountAmount
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter max discount amount"
                  />
                  {editCouponFormik.touched.maxDiscountAmount &&
                    addCouponFormik.errors.maxDiscountAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.maxDiscountAmount ===
                        "string"
                          ? addCouponFormik.errors.maxDiscountAmount
                          : "Invalid max discount amount"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Min Purchase Amount
                  </label>
                  <input
                    type="number"
                    name="minPurchaseAmount"
                    value={editCouponFormik.values.minPurchaseAmount || ""}
                    onChange={editCouponFormik.handleChange}
                    onBlur={editCouponFormik.handleBlur}
                    min="0"
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editCouponFormik.touched.minPurchaseAmount &&
                      editCouponFormik.errors.minPurchaseAmount
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Enter min purchase amount"
                  />
                  {editCouponFormik.touched.minPurchaseAmount &&
                    addCouponFormik.errors.minPurchaseAmount && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof addCouponFormik.errors.minPurchaseAmount ===
                        "string"
                          ? addCouponFormik.errors.minPurchaseAmount
                          : "Invalid min purchase amount"}
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
                    value={editCouponFormik.values.expirationDate}
                    onChange={editCouponFormik.handleChange}
                    onBlur={editCouponFormik.handleBlur}
                    min={today}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editCouponFormik.touched.expirationDate &&
                      editCouponFormik.errors.expirationDate
                        ? "border-red-500"
                        : ""
                    }`}
                    placeholder="Select expiration date"
                  />
                  {editCouponFormik.touched.expirationDate &&
                    editCouponFormik.errors.expirationDate && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editCouponFormik.errors.expirationDate ===
                        "string"
                          ? editCouponFormik.errors.expirationDate
                          : "Invalid expiration date"}
                      </p>
                    )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="isActive"
                    value={editCouponFormik.values.isActive.toString()}
                    onChange={editCouponFormik.handleChange}
                    onBlur={editCouponFormik.handleBlur}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#49bbbd] focus:ring-[#49bbbd] sm:text-sm ${
                      editCouponFormik.touched.isActive &&
                      editCouponFormik.errors.isActive
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  {editCouponFormik.touched.isActive &&
                    editCouponFormik.errors.isActive && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof editCouponFormik.errors.isActive === "string"
                          ? editCouponFormik.errors.isActive
                          : "Invalid status"}
                      </p>
                    )}
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      !editCouponFormik.isValid ||
                      editCouponFormik.isSubmitting ||
                      editCouponFormik.isValidating ||
                      !editCouponFormik.dirty
                    }
                    className={`px-4 py-2 rounded-lg text-white ${
                      !editCouponFormik.isValid ||
                      editCouponFormik.isSubmitting ||
                      editCouponFormik.isValidating ||
                      !editCouponFormik.dirty
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

export default CouponsPage;
