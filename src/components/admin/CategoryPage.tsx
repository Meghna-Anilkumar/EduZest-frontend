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
import Pagination from "../common/admin/Pagination";
import { SearchBar } from "../common/admin/SearchBar";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import Sidebar from "../common/admin/AdminSidebar";

const CategoryManagement = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { 
    data: categories = [], 
    loading = false, 
    error = null, 
    currentPage = 1, 
    totalPages = 1,
    totalCategories = 0 
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
  const limit = 5;

  useEffect(() => {
    console.log('Fetching categories for page:', page, 'search:', searchTerm);
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
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create category");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handleEditClick = useCallback((categoryId: string, categoryName: string) => {
    setSelectedCategory({ id: categoryId, name: categoryName });
    setEditModalOpen(true);
  }, []);

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
      dispatch(getAllCategoriesAction({ page, limit, search: searchTerm }));
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to toggle category status");
      setTimeout(() => setErrorMessage(null), 5000);
    }
  };

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset to first page when search changes
  }, []);

  // Calculate sidebar width based on screen size
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
          display: { xs: isMobile ? 'none' : 'block', sm: 'block' },
        }}
      >
        <Sidebar />
      </Box>

      {/* Main Content Area with scrolling */}
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
          <Box sx={{ 
            display: "flex", 
            flexDirection: { xs: 'column', sm: 'row' }, 
            justifyContent: "space-between",
            alignItems: { xs: 'stretch', sm: 'center' },
            mb: 3
          }}>
            <Typography variant="h5">
              Categories ({totalCategories} total)
            </Typography>
            <Box sx={{ width: { xs: '100%', sm: '250px' }, mt: { xs: 2, sm: 0 } }}>
              <SearchBar onSearchChange={handleSearchChange} />
            </Box>
          </Box>

          <Box 
            sx={{ 
              display: "flex", 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 2, 
              mb: 4 
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
                whiteSpace: 'nowrap',
                minWidth: { xs: '100%', sm: 'auto' } 
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
          {loading && <CircularProgress sx={{ display: "block", mx: "auto", mb: 2 }} />}
          {error && !errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer sx={{ overflow: 'auto' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Active</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <TableRow key={category._id}>
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
                          onClick={() => handleToggleBlockClick(category._id)}
                        >
                          {category.isActive ? <BlockIcon /> : <LockOpenIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3}>No categories found</TableCell>
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