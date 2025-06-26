import { useLoading } from '../../contexts/LoadingContext'

export function Spinner() {
  const { loading } = useLoading()

  if (!loading) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}>
      <div className="spinner" />
      <style>{`
        .spinner {
          width: 60px;
          height: 60px;
          border: 6px solid rgba(0,0,0,0.1);
          border-left-color: #09f;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
