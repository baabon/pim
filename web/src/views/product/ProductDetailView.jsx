import React from 'react';
import {
    Box,
    CircularProgress,
    Button,
    Snackbar,
    Alert,
    Typography
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import {
    useProductDetailData
} from '../../hooks/useProductDetailData.js';
import ProductHeader from '../../components/product/ProductHeader.jsx';
import ProductStatusDialogs from '../../components/product/ProductStatusDialogs.jsx';
import ProductGeneral from '../../components/product/ProductGeneral.jsx';
import ProductCountriesOptions from '../../components/product/ProductCountriesOptions.jsx';
import ProductDescription from '../../components/product/ProductDescription.jsx';
import ProductGallery from '../../components/product/ProductGallery.jsx';
import ProductDocumentation from '../../components/product/ProductDocumentation.jsx';
import ProductVideos from '../../components/product/ProductVideos.jsx';
import ProductPermissions from '../../components/product/ProductPermissions.jsx';
import ProductHistory from '../../components/product/ProductHistory.jsx';

import {
    useAuth
} from '../../auth/contexts/AuthContext';
import {
    APP_BAR_HEIGHT
} from '../../utils/constants.js';

export default function ProductDetailView({
    product,
    onBack,
    isLoading: isProductLoading,
    mainScrollRef
}) {
    const {
        user
    } = useAuth();

    const hookResult = useProductDetailData(product);

    if (isProductLoading || hookResult.loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100%" sx={{ bgcolor: '#f4f6f8' }}>
                <CircularProgress sx={{ color: '#0a1a28' }} />
            </Box>
        );
    }

    if (hookResult.error) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100%" sx={{ bgcolor: '#fff', p: 3 }}>
                <Typography variant="h6" color="error" sx={{ mb: 2 }}>{hookResult.error}</Typography>
                <Button variant="contained" onClick={onBack} startIcon={<ArrowBackIcon />}>Volver</Button>
            </Box>
        );
    }

    if (!hookResult.currentProduct) {
        return (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight="100%" sx={{ bgcolor: '#fff', p: 3 }}>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No hay producto seleccionado.</Typography>
                <Button variant="contained" onClick={onBack} startIcon={<ArrowBackIcon />}>Volver</Button>
            </Box>
        );
    }

    return (
        <Box sx={{
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: '#fff',
            minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px - 25px)`,
            boxSizing: 'border-box',
            padding: '0 0 25px 0 !important',
        }}>
            <ProductHeader
                currentProduct={hookResult.currentProduct}
                onBack={onBack}
                isEditingName={hookResult.isEditingName}
                editableProductName={hookResult.editableProductName}
                setEditableProductName={hookResult.setEditableProductName}
                handleSaveNameEdit={hookResult.handleSaveNameEdit}
                handleCancelNameEdit={hookResult.handleCancelNameEdit}
                status={hookResult.productStatus}
                mainScrollRef={mainScrollRef}
                showProgressBar={!!hookResult.loadingAction}
                loadingAction={hookResult.loadingAction}
                handleSave={hookResult.handleSave}
                handleReject={hookResult.handleReject}
                handleUnpublish={hookResult.handleUnpublish}
                handleRequestApproval={hookResult.handleRequestApproval}
                handlePublish={hookResult.handlePublish}
                hasBeenPublished={hookResult.currentProduct.published}
                handleReturnToEdit={hookResult.handleReturnToEdit}
                handleEditNameClick={hookResult.handleEditNameClick}
                userRole={user.role}
                userEmail={user.email}
                users={hookResult.currentProduct.related_users}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 3 }}>
                <ProductGeneral product={hookResult.currentProduct} />

                <ProductCountriesOptions
                    countrySettings={hookResult.countrySettings}
                    savedCountrySettings={hookResult.savedCountrySettings}
                    handleUpdateCountrySetting={hookResult.handleUpdateCountrySetting}
                    url={hookResult.currentProduct.url}
                    status={hookResult.productStatus}
                    userRole={user.role}
                    userEmail={user.email}
                    users={hookResult.currentProduct.related_users}
                />

                <ProductDescription
                    shortDescription={hookResult.currentProduct.short_description || ''}
                    onShortDescriptionChange={hookResult.handleFieldChange('short_description')}
                    description={hookResult.currentProduct.description || ''}
                    onDescriptionChange={hookResult.handleFieldChange('description')}
                    specifications={hookResult.currentProduct.specifications || ''}
                    onSpecificationsChange={hookResult.handleFieldChange('specifications')}
                    applications={hookResult.currentProduct.applications || ''}
                    onApplicationsChange={hookResult.handleFieldChange('applications')}
                    status={hookResult.productStatus}
                    userRole={user.role}
                    userEmail={user.email}
                    users={hookResult.currentProduct.related_users}
                />

                <ProductGallery
                    sku={hookResult.currentProduct.sku}
                    status={hookResult.productStatus}
                    userRole={user.role}
                    userEmail={user.email}
                    users={hookResult.currentProduct.related_users}
                    galleryImages={hookResult.galleryImages}
                    activeImageDragId={hookResult.activeImageDragId}
                    isDragOver={hookResult.isImageDragOver}
                    fileInputRef={hookResult.galleryFileInputRef}
                    onDeleteImage={hookResult.handleDeleteImage}
                    onImageDragStart={hookResult.handleImageDragStart}
                    onImageDragEnd={hookResult.handleImageDragEnd}
                    onImageDragCancel={hookResult.handleImageDragCancel}
                    onUploadClick={hookResult.handleImageUploadClick}
                    onFileChange={hookResult.handleImageFileChange}
                    onContainerDragOver={hookResult.handleImageContainerDragOver}
                    onContainerDragLeave={hookResult.handleImageContainerDragLeave}
                    onContainerDrop={hookResult.handleImageContainerDrop}
                />

                <ProductVideos
                    sku={hookResult.currentProduct.sku}
                    status={hookResult.productStatus}
                    userRole={user.role}
                    userEmail={user.email}
                    users={hookResult.currentProduct.related_users}
                    videoLinks={hookResult.videos}
                    newVideoUrl={hookResult.newVideoUrl}
                    activeVideoDragId={hookResult.activeVideoDragId}
                    onNewVideoUrlChange={hookResult.handleVideoUrlChange}
                    onAddVideo={hookResult.handleAddVideo}
                    onDeleteVideo={hookResult.handleDeleteVideo}
                    onVideoDragStart={hookResult.handleVideoDragStart}
                    onVideoDragEnd={hookResult.handleVideoDragEnd}
                    onVideoDragCancel={hookResult.handleVideoDragCancel}
                />

                <ProductDocumentation
                    sku={hookResult.currentProduct.sku}
                    status={hookResult.productStatus}
                    userRole={user.role}
                    userEmail={user.email}
                    users={hookResult.currentProduct.related_users}
                    documentationFiles={hookResult.documentationFiles}
                    activeDocumentDragId={hookResult.activeDocDragId}
                    isDragOver={hookResult.isDocDragOver}
                    fileInputRef={hookResult.docFileInputRef}
                    onDeleteDocument={hookResult.handleDeleteDocument}
                    onDocumentDragStart={hookResult.handleDocDragStart}
                    onDocumentDragEnd={hookResult.handleDocDragEnd}
                    onDocumentDragCancel={hookResult.handleDocDragCancel}
                    onUploadClick={hookResult.handleDocUploadClick}
                    onFileChange={hookResult.handleDocFileChange}
                    onContainerDragOver={hookResult.handleDocContainerDragOver}
                    onContainerDragLeave={hookResult.handleDocContainerDragLeave}
                    onContainerDrop={hookResult.handleDocContainerDrop}
                />

                <ProductPermissions users={hookResult.currentProduct.related_users || []} />
                <ProductHistory
                    history={hookResult.history}
                    loadingHistory={hookResult.loading}
                    errorHistory={hookResult.error}
                />
            </Box>

            <ProductStatusDialogs
                currentProductName={hookResult.currentProduct.name}
                currentProductSku={hookResult.currentProduct.sku}
                rejectComment={hookResult.rejectComment}
                setRejectComment={hookResult.setRejectComment}
                openRequestConfirm={hookResult.openRequestConfirm}
                handleCloseRequestConfirm={() => hookResult.setOpenRequestConfirm(false)}
                handleConfirmRequestApproval={hookResult.handleConfirmRequestApproval}
                openPublishConfirm={hookResult.openPublishConfirm}
                handleClosePublishConfirm={() => hookResult.setOpenPublishConfirm(false)}
                handleConfirmPublish={hookResult.handleConfirmPublish}
                openUnpublishConfirm={hookResult.openUnpublishConfirm}
                handleCloseUnpublishConfirm={() => hookResult.setOpenUnpublishConfirm(false)}
                handleConfirmUnpublish={hookResult.handleConfirmUnpublish}
                openRejectConfirm={hookResult.openRejectConfirm}
                handleCloseRejectConfirm={() => hookResult.setOpenRejectConfirm(false)}
                handleConfirmReject={hookResult.handleConfirmReject}
                openRejectCommentDialog={hookResult.openRejectCommentDialog}
                handleCloseRejectCommentDialog={() => hookResult.setOpenRejectCommentDialog(false)}
                handleSendRejectWithComment={hookResult.handleSendRejectWithComment}
            />

            <Snackbar
                open={hookResult.snackbar.open}
                autoHideDuration={5000}
                onClose={hookResult.handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={hookResult.handleSnackbarClose} severity={hookResult.snackbar.severity} sx={{ width: '100%' }}>
                    {hookResult.snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}