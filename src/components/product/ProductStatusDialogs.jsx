import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

export default function ProductStatusDialogs({
  currentProductName,
  currentProductSku,
  rejectComment,
  setRejectComment,
  openRequestConfirm,
  handleCloseRequestConfirm,
  handleConfirmRequestApproval,
  openPublishConfirm,
  handleClosePublishConfirm,
  handleConfirmPublish,
  openUnpublishConfirm,
  handleCloseUnpublishConfirm,
  handleConfirmUnpublish,
  openRejectConfirm,
  handleCloseRejectConfirm,
  handleConfirmReject,
  openRejectCommentDialog,
  handleCloseRejectCommentDialog,
  handleSendRejectWithComment,
}) {
  return (
    <>
      {/* Solicitar Aprobación Confirm Dialog */}
      <Dialog
        open={openRequestConfirm}
        onClose={handleCloseRequestConfirm}
        aria-labelledby="request-approval-dialog-title"
        aria-describedby="request-approval-dialog-description"
      >
        <DialogTitle id="request-approval-dialog-title">Solicitar Aprobación</DialogTitle>
        <DialogContent>
          <DialogContentText id="request-approval-dialog-description">
            ¿Estás seguro de que quieres solicitar la aprobación para el producto "{currentProductName}" (SKU: {currentProductSku})?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRequestConfirm} sx={{ color: '#546a7b' }}>Cancelar</Button>
          <Button
            onClick={handleConfirmRequestApproval}
            variant="contained"
            sx={{
              backgroundColor: '#21E0B2',
              '&:hover': {
                backgroundColor: '#1aab8a',
              },
            }}
          >
            Confirmar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publicar Confirm Dialog */}
      <Dialog
        open={openPublishConfirm}
        onClose={handleClosePublishConfirm}
        aria-labelledby="publish-dialog-title"
        aria-describedby="publish-dialog-description"
      >
        <DialogTitle id="publish-dialog-title">Publicar Producto</DialogTitle>
        <DialogContent>
          <DialogContentText id="publish-dialog-description">
            ¿Estás seguro de que quieres publicar el producto "{currentProductName}" (SKU: {currentProductSku})? Una vez publicado, será visible en la tienda.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePublishConfirm} sx={{ color: '#546a7b' }}>Cancelar</Button>
          <Button
            onClick={handleConfirmPublish}
            variant="contained"
            sx={{
              backgroundColor: '#21E0B2',
              '&:hover': {
                backgroundColor: '#1aab8a',
              },
            }}
          >
            Confirmar Publicación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Despublicar Confirm Dialog */}
      <Dialog
        open={openUnpublishConfirm}
        onClose={handleCloseUnpublishConfirm}
        aria-labelledby="unpublish-dialog-title"
        aria-describedby="unpublish-dialog-description"
      >
        <DialogTitle id="unpublish-dialog-title">Despublicar Producto</DialogTitle>
        <DialogContent>
          <DialogContentText id="unpublish-dialog-description">
            ¿Estás seguro de que quieres despublicar el producto "{currentProductName}" (SKU: {currentProductSku})? Ya no será visible en la tienda.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUnpublishConfirm} sx={{ color: '#546a7b' }}>Cancelar</Button>
          <Button
            onClick={handleConfirmUnpublish}
            variant="contained"
            color="error"
          >
            Confirmar Despublicación
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rechazar Confirm Dialog */}
      <Dialog
        open={openRejectConfirm}
        onClose={handleCloseRejectConfirm}
        aria-labelledby="reject-dialog-title"
        aria-describedby="reject-dialog-description"
      >
        <DialogTitle id="reject-dialog-title">Rechazar Producto</DialogTitle>
        <DialogContent>
          <DialogContentText id="reject-dialog-description">
            ¿Estás seguro de que quieres rechazar el producto "{currentProductName}" (SKU: {currentProductSku})?
            Esto lo devolverá al estado de edición.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectConfirm} sx={{ color: '#546a7b' }}>Cancelar</Button>
          <Button
            onClick={handleConfirmReject}
            variant="contained"
            color="warning"
          >
            Continuar para añadir comentario
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rechazar con Comentario Dialog */}
      <Dialog
        open={openRejectCommentDialog}
        onClose={handleCloseRejectCommentDialog}
        aria-labelledby="reject-comment-dialog-title"
      >
        <DialogTitle id="reject-comment-dialog-title">Añadir Comentario de Rechazo</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Por favor, añade un comentario sobre por qué estás rechazando este producto.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="reject-comment"
            label="Comentario"
            type="text"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRejectCommentDialog} sx={{ color: '#546a7b' }}>Cancelar</Button>
          <Button
            onClick={handleSendRejectWithComment}
            variant="contained"
            color="error"
            disabled={rejectComment.trim() === ''}
          >
            Rechazar y Enviar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}