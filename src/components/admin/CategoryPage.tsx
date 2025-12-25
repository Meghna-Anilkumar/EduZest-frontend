import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  createCategoryAction,
  getAllCategoriesAction,
  editCategoryAction,
  deleteCategoryAction,
} from "../../redux/actions/categoryActions";
import EditCategoryModal from "./EditCategoryModal";
import Pagination from "../common/Pagination";
import { SearchBar } from "../common/SearchBar";
import {
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  CircularProgress,
  Alert,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Sidebar from "../common/admin/AdminSidebar";

const CategoryManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    data: categories = [],
    loading = false,
    error = null,
    currentPage = 1,
    totalPages = 1,
    totalCategories = 0,
  } = useSelector((state: RootState) => state.category);

  const [categoryName, setCategoryName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [categoryToToggle, setCategoryToToggle] = useState<{
    id: string;
    isActive: boolean;
  } | null>(null);
  const limit = 5;

  useEffect(() => {
    dispatch(getAllCategoriesAction({ page, limit, search: searchTerm }));
  }, [dispatch, page, searchTerm]);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }

    try {
      await dispatch(createCategoryAction({ categoryName })).unwrap();
      setCategoryName("");
      setErrorMessage(null);
      dispatch(getAllCategoriesAction({ page, limit, search: searchTerm }));
    } catch (err) {
      const error = err as { message?: string };
      setErrorMessage(error.message ?? "Failed to create category");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEditClick = useCallback(
    (categoryId: string, categoryName: string) => {
      setSelectedCategory({ id: categoryId, name: categoryName });
      setEditModalOpen(true);
    },
    []
  );

  const handleConfirmEdit = async (updatedName: string) => {
    if (!selectedCategory) return;
    try {
      await dispatch(
        editCategoryAction({
          categoryId: selectedCategory.id,
          categoryName: updatedName,
        })
      ).unwrap();
      setErrorMessage(null);
      dispatch(getAllCategoriesAction({ page, limit, search: searchTerm }));

      // Close modal and clear selected category
      setEditModalOpen(false);
      setSelectedCategory(null);
    } catch (error) {
      const err = error as { message?: string };
      setErrorMessage(err.message ?? "Failed to update category");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedCategory(null); // Critical fix: clear previous data
  };

  const handleToggleBlockClick = (categoryId: string, isActive: boolean) => {
    setCategoryToToggle({ id: categoryId, isActive });
    setConfirmDialogOpen(true);
  };

  const handleConfirmToggle = async () => {
    if (!categoryToToggle) return;
    try {
      await dispatch(deleteCategoryAction(categoryToToggle.id)).unwrap();
      setErrorMessage(null);
      dispatch(getAllCategoriesAction({ page, limit, search: searchTerm }));
    } catch (error) {
      const err = error as { message?: string };
      setErrorMessage(err.message ?? "Failed to toggle category status");
      setTimeout(() => setErrorMessage(null), 5000);
    }
    setConfirmDialogOpen(false);
    setCategoryToToggle(null);
  };

  const handleCancelToggle = () => {
    setConfirmDialogOpen(false);
    setCategoryToToggle(null);
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      setPage(1);
    },
    []
  );

  const startSerialNumber = (currentPage - 1) * limit + 1;

  const sidebarWidth = isMobile ? 0 : 240;

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* Fixed Sidebar */}
      <Box
        component="nav"
        sx={{
          width: { sm: sidebarWidth },
          flexShrink: 0,
          position: "fixed",
          height: "100vh",
          zIndex: 1200,
          display: { xs: isMobile ? "none" : "block", sm: "block" },
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${sidebarWidth}px)` },
          ml: { sm: `${sidebarWidth}px` },
          overflow: "auto",
          height: "100vh",
        }}
      >
        <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: { xs: "stretch", sm: "center" },
              mb: 3,
            }}
          >
            <Typography variant="h5">
              Categories ({totalCategories} total)
            </Typography>
            <Box
              sx={{ width: { xs: "100%", sm: "250px" }, mt: { xs: 2, sm: 0 } }}
            >
              <SearchBar onSearchChange={handleSearchChange} />
            </Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 4,
            }}
          >
            <TextField
              fullWidth
              placeholder="Enter Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={handleAddCategory}
              disabled={loading}
              sx={{
                whiteSpace: "nowrap",
                minWidth: { xs: "100%", sm: "auto" },
              }}
            >
              <AddIcon sx={{ mr: 1 }} />
              ADD CATEGORY
            </Button>
          </Box>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          {loading && (
            <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />
          )}
          {error && !errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer sx={{ overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Sl. No.</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category, index) => (
                    <TableRow key={category._id}>
                      <TableCell>{startSerialNumber + index}</TableCell>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>{category.isActive ? "Yes" : "No"}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleEditClick(category._id, category.categoryName)
                          }
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleToggleBlockClick(
                              category._id,
                              category.isActive
                            )
                          }
                        >
                          {category.isActive ? <BlockIcon /> : <LockOpenIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4}>No categories found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalCategories > 0 && (
            <Box sx={{ mt: 3 }}>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </Box>
          )}
        </Paper>
      </Box>

      {/* Edit Modal - only render when a category is selected */}
      {selectedCategory && (
        <EditCategoryModal
          open={editModalOpen}
          onClose={handleCloseEditModal}
          categoryName={selectedCategory.name}
          onConfirm={handleConfirmEdit}
        />
      )}

      {/* Confirmation Dialog for Blocking/Unblocking */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCancelToggle}
        aria-labelledby="confirm-toggle-dialog-title"
        aria-describedby="confirm-toggle-dialog-description"
      >
        <DialogTitle id="confirm-toggle-dialog-title">
          {categoryToToggle?.isActive ? "Block Category" : "Unblock Category"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirm-toggle-dialog-description">
            Are you sure you want to{" "}
            {categoryToToggle?.isActive ? "block" : "unblock"} this category?
            {categoryToToggle?.isActive
              ? " Blocking this category may affect associated courses or content."
              : " Unblocking this category will make it active again."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelToggle} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmToggle} color="error" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;