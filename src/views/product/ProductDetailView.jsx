import React, { useRef } from 'react';
import {
  Box, CircularProgress, Button, Snackbar, Alert, Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useProductDetailData } from '../../hooks/useProductDetailData.js';
import ProductHeader from '../../components/product/ProductHeader.jsx';
import ProductStatusDialogs from '../../components/product/ProductStatusDialogs.jsx';
import ProductGeneral from '../../components/product/ProductGeneral.jsx';
import ProductCountriesOptions from '../../components/product/ProductCountriesOptions.jsx';
import ProductDescription from '../../components/product/ProductDescription.jsx';
import ProductGallery from '../../components/product/ProductGallery.jsx';
import ProductDocumentation from '../../components/product/ProductDocumentation.jsx';
import ProductVideos from '../../components/product/ProductVideos.jsx';
import ProductExternalResources from '../../components/product/ProductExternalResources.jsx';
import ProductPermissions from '../../components/product/ProductPermissions.jsx';
import ProductHistory from '../../components/product/ProductHistory.jsx';

import { useAuth } from '../../auth/contexts/AuthContext';
import { APP_BAR_HEIGHT } from '../../utils/constants.js';

export default function ProductDetailView({ product, onBack, isLoading, mainScrollRef }) {
  const { user } = useAuth();

  const {
    currentProduct,
    isEditingName, editableProductName, setIsEditingName, setEditableProductName,
    countrySettings, productStatus,
    showProgressBar, loadingAction,
    snackbarOpen, snackbarMessage, snackbarSeverity, handleSnackbarClose,
    openRequestConfirm, openPublishConfirm, openRejectConfirm, openRejectCommentDialog, openUnpublishConfirm,
    rejectComment, setRejectComment,
    handleSave,
    // === Handlers para ProductDescription (defensivos) ===
    handleShortDescriptionChange: rawHandleShortDescriptionChange,
    handleDescriptionChange: rawHandleDescriptionChange,
    handleSpecificationsChange: rawHandleSpecificationsChange,
    handleApplicationsChange: rawHandleApplicationsChange,
    // === Country-specific handlers (defensivos) ===
    getCurrentCountryData: rawGetCurrentCountryData,
    handleUpdateCountrySetting: rawHandleUpdateCountrySetting,
    // === Name Edit Handlers (defensivos) ===
    handleEditNameClick: rawHandleEditNameClick,
    handleSaveNameEdit: rawHandleSaveNameEdit,
    handleCancelNameEdit: rawHandleCancelNameEdit,
    // === Product Status Action Handlers (defensivos) ===
    handleRequestApproval: rawHandleRequestApproval,
    handlePublish: rawHandlePublish,
    handleUnpublish: rawHandleUnpublish,
    handleReject: rawHandleReject,
    handleReturnToEdit: rawHandleReturnToEdit,
    // === Dialog Confirmation/Close Handlers (defensivos) ===
    handleConfirmRequestApproval: rawHandleConfirmRequestApproval,
    handleCloseRequestConfirm: rawHandleCloseRequestConfirm,
    handleConfirmPublish: rawHandleConfirmPublish,
    handleClosePublishConfirm: rawHandleClosePublishConfirm,
    handleConfirmUnpublish: rawHandleConfirmUnpublish,
    handleCloseUnpublishConfirm: rawHandleUnpublishConfirm,
    handleConfirmReject: rawHandleConfirmReject,
    handleCloseRejectConfirm: rawHandleCloseRejectConfirm,
    handleSendRejectWithComment: rawHandleSendRejectWithComment,
    handleCloseRejectCommentDialog: rawHandleCloseRejectCommentDialog,

    // === Video Management Exports (AHORA DESDE HOOK) ===
    videoLinks, newVideoUrl, activeVideoDragId,
    handleVideoUrlChange: rawHandleVideoUrlChange,
    handleAddVideo: rawHandleAddVideo,
    handleDeleteVideo: rawHandleDeleteVideo,
    handleVideoDragStart: rawHandleVideoDragStart,
    handleVideoDragEnd: rawHandleVideoDragEnd,
    handleVideoDragCancel: rawHandleVideoDragCancel,
    MAX_VIDEOS_TOTAL: MAX_VIDEOS_TOTAL_CONST,
    videoSnackbarOpen,
    videoSnackbarMessage,
    videoSnackbarSeverity,
    handleVideoSnackbarClose,

    // === Document Management Exports ===
    documentationFiles,
    handleDeleteDocument: rawHandleDeleteDocument,
    handleDocumentDragStart: rawHandleDocumentDragStart,
    handleDocumentDragEnd: rawHandleDocumentDragEnd,
    handleDocumentDragCancel: rawHandleDocumentDragCancel,
    handleUploadClick: rawHandleUploadClick,
    handleFileChange: rawHandleFileChange,
    handleContainerDrop: rawHandleContainerDrop,
    isDocDragOver,
    docFileInputRef,
    MAX_DOCUMENT_FILE_SIZE_MB,
    MAX_DOCUMENTS_TOTAL,
    docSnackbarOpen,
    docSnackbarMessage,
    docSnackbarSeverity,
    handleDocSnackbarClose,
    showDocSnackbar,

    // === Gallery Management Exports ===
    galleryImages,
    handleDeleteImage: rawHandleDeleteImage,
    handleImageDragStart: rawHandleImageDragStart,
    handleImageDragEnd: rawHandleImageDragEnd,
    handleImageDragCancel: rawHandleImageDragCancel,
    handleUploadClick: rawHandleImageUploadClick,
    handleFileChange: rawHandleImageFileChange,
    handleContainerDragOver: rawHandleImageContainerDragOver,
    handleContainerDragLeave: rawHandleImageContainerDragLeave,
    handleContainerDrop: rawHandleImageContainerDrop,
    isImageDragOver,
    imageFileInputRef,
    MAX_GALLERY_IMAGES_TOTAL: MAX_GALLERY_IMAGES_TOTAL_CONST,
    MAX_GALLERY_IMAGE_SIZE_KB: MAX_GALLERY_IMAGE_SIZE_KB_CONST,
    REQUIRED_GALLERY_IMAGE_WIDTH: REQUIRED_GALLERY_IMAGE_WIDTH_CONST,
    REQUIRED_GALLERY_IMAGE_HEIGHT: REQUIRED_GALLERY_IMAGE_HEIGHT_CONST,
    gallerySnackbarOpen,
    gallerySnackbarMessage,
    gallerySnackbarSeverity,
    handleGallerySnackbarClose,

    // === History Exports ===
    history,
    loadingHistory,
    errorHistory,
  } = useProductDetailData(product);

  const handleShortDescriptionChange = typeof rawHandleShortDescriptionChange === 'function' ? rawHandleShortDescriptionChange : () => {};
  const handleDescriptionChange = typeof rawHandleDescriptionChange === 'function' ? rawHandleDescriptionChange : () => {};
  const handleSpecificationsChange = typeof rawHandleSpecificationsChange === 'function' ? rawHandleSpecificationsChange : () => {};
  const handleApplicationsChange = typeof rawHandleApplicationsChange === 'function' ? rawHandleApplicationsChange : () => {};

  const getCurrentCountryData = typeof rawGetCurrentCountryData === 'function' ? rawGetCurrentCountryData : () => ({});
  const handleUpdateCountrySetting = typeof rawHandleUpdateCountrySetting === 'function' ? rawHandleUpdateCountrySetting : () => {};

  const handleEditNameClick = typeof rawHandleEditNameClick === 'function' ? rawHandleEditNameClick : () => {};
  const handleSaveNameEdit = typeof rawHandleSaveNameEdit === 'function' ? rawHandleSaveNameEdit : () => {};
  const handleCancelNameEdit = typeof rawHandleCancelNameEdit === 'function' ? rawHandleCancelNameEdit : () => {};

  const handleRequestApproval = typeof rawHandleRequestApproval === 'function' ? rawHandleRequestApproval : () => {};
  const handlePublish = typeof rawHandlePublish === 'function' ? rawHandlePublish : () => {};
  const handleUnpublish = typeof rawHandleUnpublish === 'function' ? rawHandleUnpublish : () => {};
  const handleReject = typeof rawHandleReject === 'function' ? rawHandleReject : () => {};
  const handleReturnToEdit = typeof rawHandleReturnToEdit === 'function' ? rawHandleReturnToEdit : () => {};

  const handleConfirmRequestApproval = typeof rawHandleConfirmRequestApproval === 'function' ? rawHandleConfirmRequestApproval : () => {};
  const handleCloseRequestConfirm = typeof rawHandleCloseRequestConfirm === 'function' ? rawHandleCloseRequestConfirm : () => {};
  const handleConfirmPublish = typeof rawHandleConfirmPublish === 'function' ? rawHandleConfirmPublish : () => {};
  const handleClosePublishConfirm = typeof rawHandleClosePublishConfirm === 'function' ? rawHandleClosePublishConfirm : () => {};
  const handleConfirmUnpublish = typeof rawHandleConfirmUnpublish === 'function' ? rawHandleConfirmUnpublish : () => {};
  const handleCloseUnpublishConfirm = typeof rawHandleUnpublishConfirm === 'function' ? rawHandleUnpublishConfirm : () => {};
  const handleConfirmReject = typeof rawHandleConfirmReject === 'function' ? rawHandleConfirmReject : () => {};
  const handleCloseRejectConfirm = typeof rawHandleCloseRejectConfirm === 'function' ? rawHandleCloseRejectConfirm : () => {};
  const handleSendRejectWithComment = typeof rawHandleSendRejectWithComment === 'function' ? rawHandleSendRejectWithComment : () => {};
  const handleCloseRejectCommentDialog = typeof rawHandleCloseRejectCommentDialog === 'function' ? rawHandleCloseRejectCommentDialog : () => {};

  // === Video Management Handlers (defensivos) ===
  const handleVideoUrlChange = typeof rawHandleVideoUrlChange === 'function' ? rawHandleVideoUrlChange : () => {};
  const handleAddVideo = typeof rawhandleAddVideo === 'function' ? rawhandleAddVideo : () => {};
  const handleDeleteVideo = typeof rawhandleDeleteVideo === 'function' ? rawhandleDeleteVideo : () => {};
  const handleVideoDragStart = typeof rawHandleVideoDragStart === 'function' ? rawHandleVideoDragStart : () => {};
  const handleVideoDragEnd = typeof rawHandleVideoDragEnd === 'function' ? rawHandleVideoDragEnd : () => {};
  const handleVideoDragCancel = typeof rawHandleVideoDragCancel === 'function' ? rawHandleVideoDragCancel : () => {};

  // === Document Management Handlers (defensivos) ===
  const handleDeleteDocument = typeof rawHandleDeleteDocument === 'function' ? rawHandleDeleteDocument : () => {};
  const handleDocumentDragStart = typeof rawHandleDocumentDragStart === 'function' ? rawHandleDocumentDragStart : () => {};
  const handleDocumentDragEnd = typeof rawHandleDocumentDragEnd === 'function' ? rawHandleDocumentDragEnd : () => {};
  const handleDocumentDragCancel = typeof rawHandleDocumentDragCancel === 'function' ? rawHandleDocumentDragCancel : () => {};
  const handleUploadClick = typeof rawHandleUploadClick === 'function' ? rawHandleUploadClick : () => {};
  const handleFileChange = typeof rawHandleFileChange === 'function' ? rawHandleFileChange : () => {};
  const handleContainerDrop = typeof rawHandleContainerDrop === 'function' ? rawHandleContainerDrop : () => {};

  // === Gallery Management Handlers (defensivos) ===
  const handleDeleteImage = typeof rawHandleDeleteImage === 'function' ? rawHandleDeleteImage : () => {};
  const handleImageDragStart = typeof rawHandleImageDragStart === 'function' ? rawHandleImageDragStart : () => {};
  const handleImageDragEnd = typeof rawHandleImageDragEnd === 'function' ? rawHandleImageDragEnd : () => {};
  const handleImageDragCancel = typeof rawHandleImageDragCancel === 'function' ? rawHandleImageDragCancel : () => {};
  const handleImageUploadClick = typeof rawHandleImageUploadClick === 'function' ? rawHandleImageUploadClick : () => {};
  const handleImageFileChange = typeof rawHandleImageFileChange === 'function' ? rawHandleImageFileChange : () => {};
  const handleImageContainerDragOver = typeof rawHandleImageContainerDragOver === 'function' ? rawHandleImageContainerDragOver : () => {};
  const handleImageContainerDragLeave = typeof rawHandleImageContainerDragLeave === 'function' ? rawHandleImageContainerDragLeave : () => {};
  const handleImageContainerDrop = typeof rawHandleImageContainerDrop === 'function' ? rawHandleImageContainerDrop : () => {};

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100%" sx={{ bgcolor: '#f4f6f8' }} >
        <CircularProgress sx={{ color: '#0a1a28' }} />
      </Box>
    );
  }

  if (!currentProduct) {
    return (
      <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100%" sx={{ bgcolor: '#fff', p: 3 }} >
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}> No hay producto seleccionado para mostrar detalles. </Typography>
        <Button variant="contained" onClick={onBack} startIcon={<ArrowBackIcon />} sx={{ mt: 2, backgroundColor: '#0a1a28', '&:hover': { backgroundColor: '#21E0B2', transform: 'translateY(-2px)', }, transition: 'all 0.3s ease-in-out', }} > Volver </Button>
      </Box>
    );
  }

  return (
    <Box sx={{
       p: { xs: 2, sm: 3, md: 4 }, bgcolor: '#fff',
       minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px - 25px)`, boxSizing: 'border-box',
       padding: '0 0 25px 0 !important',
    }}>
      <ProductHeader
        currentProduct={currentProduct}
        onBack={onBack}
        isEditingName={isEditingName}
        editableProductName={editableProductName}
        setIsEditingName={setIsEditingName}
        setEditableProductName={setEditableProductName}
        handleSaveNameEdit={handleSaveNameEdit}
        handleCancelNameEdit={handleCancelNameEdit}
        status={productStatus}
        mainScrollRef={mainScrollRef}
        showProgressBar={showProgressBar}
        loadingAction={loadingAction}
        handleSave={handleSave}
        handleReject={handleReject}
        handleUnpublish={handleUnpublish}
        handleRequestApproval={handleRequestApproval}
        handlePublish={handlePublish}
        hasBeenPublished={currentProduct.published}
        handleReturnToEdit={handleReturnToEdit}
        handleEditNameClick={handleEditNameClick}
        userRole={user.role}
        userEmail={user.email}
        users={currentProduct.related_users}
      />

      {currentProduct && <ProductGeneral product={currentProduct} />}
      {currentProduct && (
        <ProductCountriesOptions
          countrySettings={countrySettings}
          handleUpdateCountrySetting={handleUpdateCountrySetting}
          getCurrentCountryData={getCurrentCountryData}
          status={productStatus}
          userRole={user.role}
          userEmail={user.email}
          users={currentProduct.related_users}
        />
      )}
      {currentProduct && <ProductDescription
        shortDescription={currentProduct.short_description || ''}
        onShortDescriptionChange={handleShortDescriptionChange}
        description={currentProduct.description || ''}
        onDescriptionChange={handleDescriptionChange}
        specifications={currentProduct.specifications || ''}
        onSpecificationsChange={handleSpecificationsChange}
        applications={currentProduct.applications || ''}
        onApplicationsChange={handleApplicationsChange}
        status={productStatus}
        userRole={user.role}
        userEmail={user.email}
        users={currentProduct.related_users}
      />}
      {currentProduct && <ProductGallery
        sku={currentProduct.sku}
        status={productStatus}
        userRole={user.role}
        userEmail={user.email}
        users={currentProduct.related_users}
        productGallery={galleryImages}
        onDeleteImage={handleDeleteImage}
        onImageDragStart={handleImageDragStart}
        onImageDragEnd={handleImageDragEnd}
        onImageDragCancel={handleImageDragCancel}
        onUploadClick={handleImageUploadClick}
        onFileChange={handleImageFileChange}
        onContainerDragOver={handleImageContainerDragOver}
        onContainerDragLeave={handleImageContainerDragLeave}
        onContainerDrop={handleImageContainerDrop}
        isDragOver={isImageDragOver}
        fileInputRef={imageFileInputRef}
        maxImagesTotal={MAX_GALLERY_IMAGES_TOTAL_CONST}
        maxImageSizeKb={MAX_GALLERY_IMAGE_SIZE_KB_CONST}
        requiredWidth={REQUIRED_GALLERY_IMAGE_WIDTH_CONST}
        requiredHeight={REQUIRED_GALLERY_IMAGE_HEIGHT_CONST}
        snackbarOpen={gallerySnackbarOpen}
        snackbarMessage={gallerySnackbarMessage}
        snackbarSeverity={gallerySnackbarSeverity}
        onSnackbarClose={handleGallerySnackbarClose}
      />}
      {currentProduct && <ProductVideos
        sku={currentProduct.sku}
        status={productStatus}
        userRole={user.role}
        userEmail={user.email}
        users={currentProduct.related_users}
        productVideos={videoLinks.map(video => video.url)}
        newVideoUrl={newVideoUrl}
        activeVideoDragId={activeVideoDragId}
        onNewVideoUrlChange={handleVideoUrlChange}
        onAddVideo={handleAddVideo}
        onDeleteVideo={handleDeleteVideo}
        onVideoDragStart={handleVideoDragStart}
        onVideoDragEnd={handleVideoDragEnd}
        onVideoDragCancel={handleVideoDragCancel}
        maxVideosTotal={MAX_VIDEOS_TOTAL_CONST}
        snackbarOpen={videoSnackbarOpen}
        snackbarMessage={videoSnackbarMessage}
        snackbarSeverity={videoSnackbarSeverity}
        onSnackbarClose={handleVideoSnackbarClose}
      />}
      {currentProduct && <ProductDocumentation
        sku={currentProduct.sku}
        status={productStatus}
        userRole={user.role}
        userEmail={user.email}
        users={currentProduct.related_users}
        productDocumentation={documentationFiles}
        onDeleteDocument={handleDeleteDocument}
        onDocumentDragStart={handleDocumentDragStart}
        onDocumentDragEnd={handleDocumentDragEnd}
        onDocumentDragCancel={handleDocumentDragCancel}
        onUploadClick={handleUploadClick}
        onFileChange={handleFileChange}
        onContainerDrop={handleContainerDrop}
        isDragOver={isDocDragOver}
        fileInputRef={docFileInputRef}
        maxFileSizeMb={MAX_DOCUMENT_FILE_SIZE_MB}
        maxFilesTotal={MAX_DOCUMENTS_TOTAL}
        snackbarOpen={docSnackbarOpen}
        snackbarMessage={docSnackbarMessage}
        snackbarSeverity={docSnackbarSeverity}
        onSnackbarClose={handleDocSnackbarClose}
      />}
      {currentProduct && <ProductExternalResources
        url={currentProduct.url}
      />}
      {currentProduct && <ProductPermissions
        users={currentProduct.related_users || []}
      />}
      {currentProduct && <ProductHistory
        history={history}
        loadingHistory={loadingHistory}
        errorHistory={errorHistory}
      />}

      <ProductStatusDialogs
        currentProductName={currentProduct?.name || ''} currentProductSku={currentProduct?.sku || ''}
        rejectComment={rejectComment} setRejectComment={setRejectComment}
        openRequestConfirm={openRequestConfirm} handleCloseRequestConfirm={handleCloseRequestConfirm} handleConfirmRequestApproval={handleConfirmRequestApproval}
        openPublishConfirm={openPublishConfirm} handleClosePublishConfirm={handleClosePublishConfirm} handleConfirmPublish={handleConfirmPublish}
        openUnpublishConfirm={openUnpublishConfirm} handleCloseUnpublishConfirm={handleCloseUnpublishConfirm} handleConfirmUnpublish={handleConfirmUnpublish}
        openRejectConfirm={openRejectConfirm} handleCloseRejectConfirm={handleCloseRejectConfirm} handleConfirmReject={handleConfirmReject}
        openRejectCommentDialog={openRejectCommentDialog} handleCloseRejectCommentDialog={handleCloseRejectCommentDialog} handleSendRejectWithComment={handleSendRejectWithComment}
      />

      <Snackbar open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}> {snackbarMessage} </Alert>
      </Snackbar>
    </Box>
  );
}