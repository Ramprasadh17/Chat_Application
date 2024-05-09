import React, { useEffect, useState } from "react";
import { Modal, Box, Input, Button } from "@mui/material";
import "./Styles/profilepic.css";
// import "../../Backend/uploads/";
import axios from "axios";

function ProfilePic({ open, handleClose, userId }) {
  console.log(userId);
  const [image, setImage] = useState();
  const [dp, setDp] = useState(" ");

  const handleFileChange = (event) => {
    console.log(event.target.files[0]);
    // const dp = event.target.files[0];
    // console.log(dp);
    setImage(event.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    console.log(image);
    const formData = new FormData();
    console.log("FormData:", formData);
    formData.append("image", image);
    console.log(formData.get("image"));

    await axios
      .post(`http://localhost:9000/${userId}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response.data);
        fetchImages();
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleCloseModal = () => {
    setImage([]); // Reset selected file
    handleClose(); // Close the modal
  };

  const fetchImages = async () => {
    try {
      // Make a GET request to fetch the list of file names
      const response = await axios.get(
        `http://localhost:9000/${userId}/uploads`
      );
      console.log(response.data[0]);
      const pp = response.data[0];
      console.log(typeof pp);
      // Set the list of file names received from the server
      setDp(pp);
    } catch (error) {
      console.error("Error fetching images:", error);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [userId]);
  console.log(dp);
  console.log(typeof dp);
  const imagePath = `../../Backend/uploads/${dp}`;

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 400,
            bgcolor: "background.paper",
            border: "2px solid #000",
            boxShadow: 24,
            p: 4,
          }}
        >
          <Input
            type="file"
            onChange={handleFileChange}
            placeholder="Select a photo"
          />
          {/* <div className="viewpic">
            {image.length > 0 ? (
              <Box>
                {
                  <img
                    src={URL.createObjectURL(image[0])}
                    alt="Uploaded Photo"
                    style={{
                      width: "400px",
                      height: "300px",
                      objectFit: "contain",
                    }}
                  />
                }
              </Box>
            ) : (
              <Box>
                <Typography>Upload Pic</Typography>
              </Box>
            )}
          </div> */}
          <Button
            variant="contained"
            color="primary"
            disabled={!image}
            onClick={handleUpload}
            style={{ marginTop: "16px", marginRight: "8px" }}
          >
            Upload
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleCloseModal}
            style={{ marginTop: "16px" }}
          >
            Close
          </Button>
        </Box>
        {/* {dp && (
          <img
            src={`http://localhost:9000/Backend/uploads/${dp}`} // Adjust the path as needed
            alt="Profile Pic"
          />
        )}{" "} */}
      </Modal>
    </>
  );
}

export default ProfilePic;
