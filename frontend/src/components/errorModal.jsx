
const ErrorModal = ({}) => {
    return (
      <div style={styles.modal}>
        <div style={styles.modalContent}>
          <h3>الأخطاء</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {errorModal.message.split('\n').map((line, index) => (
              <p key={index} style={{ margin: '5px 0' }}>{line}</p>
            ))}
          </div>
          <button 
            style={styles.button}
            onClick={() => {
              setErrorModal({ isOpen: false, message: "" });
              setImportedData(importedData); // Continue with the import
              setShowModal(true);
            }}
          >
            متابعة
          </button>
        </div>
      </div>
    );
  };
