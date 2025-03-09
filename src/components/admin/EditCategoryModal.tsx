import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  Fade,
  Backdrop,
} from "@mui/material";

interface EditCategoryModalProps {
  open: boolean;
  onClose: () => void;
  categoryName: string;
  onConfirm: (updatedName: string) => void;
}

const EditCategoryModal: React.FC<EditCategoryModalProps> = ({
  open,
  onClose,
  categoryName,
  onConfirm,
}) => {
  const [updatedName, setUpdatedName] = useState(categoryName);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const handleUpdateClick = () => {
    setConfirmationOpen(true);
  };

  const handleConfirmUpdate = () => {
    onConfirm(updatedName);
    setConfirmationOpen(false);
    setSuccessOpen(true);
  };

  return (
    <>
      {/* Edit Modal */}
      <Modal open={open} onClose={onClose} BackdropComponent={Backdrop}>
        <Fade in={open}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 300,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Edit Category
            </Typography>
            <TextField
              fullWidth
              value={updatedName}
              onChange={(e) => setUpdatedName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleUpdateClick}
                disabled={!updatedName.trim()}
              >
                Update
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Confirmation Modal */}
      <Modal open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <Fade in={confirmationOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 300,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2 }}>
              Are you sure you want to update this category?
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Button variant="outlined" onClick={() => setConfirmationOpen(false)}>
                No
              </Button>
              <Button variant="contained" onClick={handleConfirmUpdate}>
                Yes
              </Button>
            </Box>
          </Box>
        </Fade>
      </Modal>

      {/* Success Modal */}
      <Modal open={successOpen} onClose={() => setSuccessOpen(false)}>
        <Fade in={successOpen}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              bgcolor: "background.paper",
              boxShadow: 24,
              p: 4,
              borderRadius: 2,
              minWidth: 300,
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
              Category Updated Successfully!
            </Typography>
            <Button fullWidth variant="contained" onClick={() => setSuccessOpen(false)}>
              OK
            </Button>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default EditCategoryModal;
