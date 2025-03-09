import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../redux/store";
import {
  createCategoryAction,
  getAllCategoriesAction,
  editCategoryAction,
  deleteCategoryAction,
} from "../../redux/actions/categoryActions";
import EditCategoryModal from "./EditCategoryModal";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Sidebar from "../common/admin/AdminSidebar";

const CategoryManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: categories, loading, error } = useSelector(
    (state: RootState) => state.category
  );

  const [categoryName, setCategoryName] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getAllCategoriesAction());
  }, [dispatch]);

  const handleAddCategory = async () => {
    if (!categoryName.trim()) {
      setErrorMessage("Category name is required.");
      return;
    }
    
    try {
      await dispatch(createCategoryAction({ categoryName })).unwrap();
      setCategoryName("");
      setErrorMessage(null);
      dispatch(getAllCategoriesAction());
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create category");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEditClick = (categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setEditModalOpen(true);
  };

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
      dispatch(getAllCategoriesAction());
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to update category");
      setTimeout(() => setErrorMessage(null), 5000);
    }
    setEditModalOpen(false);
  };

  const handleToggleBlockClick = async (categoryId: string) => {
    try {
      await dispatch(deleteCategoryAction(categoryId)).unwrap();
      setErrorMessage(null);
      dispatch(getAllCategoriesAction());
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to toggle category status");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Categories
          </Typography>

          <Box sx={{ display: "flex", gap: 2, mb: 4 }}>
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
          {loading && <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />}
          {error && !errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories?.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell>{category.categoryName}</TableCell>
                    <TableCell>
                      {category.isActive ? "Yes" : "No"}
                    </TableCell>
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
                        onClick={() => handleToggleBlockClick(category._id)}
                      >
                        {category.isActive ? <BlockIcon /> : <LockOpenIcon />}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Box>

      {selectedCategory && (
        <EditCategoryModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          categoryName={selectedCategory.name}
          onConfirm={handleConfirmEdit}
        />
      )}
    </Box>
  );
};

export default CategoryManagement;