import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 

import { Modal, Button, Card, Form, Nav, Tab, Badge, Accordion } from "react-bootstrap";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaPlus,
  FaUser,
  FaPhone,
  FaIdCard,
  FaBriefcase,
  FaFileAlt,
  FaTruck,
  FaMoneyBillWave,
  FaCheck,
  FaTimes
} from "react-icons/fa";
import { fetchData, putData, postData, deleteData } from "../api";
import './driverProfile.css';


const DriverProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driver, setDriver] = useState({});
  const [trips, setTrips] = useState([]);
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [editingPaymentId, setEditingPaymentId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  // const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");
  const [userRole, setUserRole] = useState( sessionStorage.getItem("role")); 
  



  //MARK: GET NOTES
const fetchDriver = async () => {
  try {
    // Fetch driver details and trips with notes in one request
    const { driver, trips } = await fetchData(`dashboard/drivers/${id}`);
    
    if (!driver) {
      throw new Error("السائق غير موجود");
    }
		if (trips) {
      trips.forEach(trip => {
        if (trip.trip_notes) {
          trip.trip_notes = trip.trip_notes.map(note => ({
            ...note,
            timestamp: new Date(note.createdAt).toLocaleString('ar-EG', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })
          }));
        }
      });
    }

    console.log("🔹 Driver Data:", driver);
    console.log("🔹 Trips with Notes:", trips);

    setDriver(driver || {});
    setTrips(trips || []);
  } catch (error) {
    console.error("❌ Error fetching driver data", error);
    setErrMessage(error.message);
  }
};

  

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const toggleExpand = (tripId) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  //MARK: ADD NOTE
  
  const addNote = async (tripId) => {
    if (!newNote.trim()) return;
    try {
      const data = await postData(`dashboard/drivers/${id}?action=add`, {
        trip_id: tripId,
        driver_id: id,
        note: newNote,
      });

      const formattedNote = {
        ...data.newNote,
        timestamp: new Date(data.newNote.createdAt).toLocaleString("ar-EG", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }
      setTrips(trips.map((trip) => trip.id === tripId ? { ...trip, trip_notes: [...trip.trip_notes, formattedNote] } : trip));
      setNewNote("");
    } catch (error) {
      console.error("Error adding note", error);
      setErrMessage(error.message);
    }
  };

  //MARK: UPDATE NOTE
  const updateNote = async (noteId, tripId) => {
    if (!editNote.trim()) return;
    try {
      await putData(`dashboard/drivers/${id}?action=edit`, {
        note_id: noteId,
        note: editNote,
      });
      setTrips(trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              trip_notes: trip.trip_notes.map((note) =>
                note.id === noteId ? { ...note, content: editNote } : note
              ),
            }
          : trip
      ));
      setEditNote("");
      setEditingNoteId(null);
    } catch (error) {
      console.error("Error updating note", error);
      setErrMessage(error.message);
    }
  };

    //MARK: DELETE NOTE
  const deleteNote = async (noteId, tripId) => {
    try {
      await deleteData(`dashboard/drivers/${id}?action=del`, { note_id: noteId });
      setTrips(trips.map((trip) => trip.id === tripId ? { ...trip, trip_notes: trip.trip_notes.filter((note) => note.id !== noteId) } : trip));
    } catch (error) {
      console.error("Error deleting note", error);
      setErrMessage(error.message);
    }
  };



  // MARK: ADD PAYMENT
  const startEditingPayment = (tripId) => {
    setEditingPaymentId(tripId);
    setPaymentAmount("");
  };

  const cancelEditingPayment = () => {
    setEditingPaymentId(null);
    setPaymentAmount("");
  };

  const submitPayment = async (tripId) => {
    if (!paymentAmount || isNaN(parseFloat(paymentAmount)) || parseFloat(paymentAmount) <= 0) {
      setErrMessage("الرجاء إدخال مبلغ صحيح");
      return;
    }

    try {
      const amount = parseFloat(paymentAmount);
      const trip = trips.find(t => t.id === tripId);
      
      if (!trip) {
        throw new Error("الرحلة غير موجودة");
      }

      const currentReceived = parseFloat(trip.total_received_cash) || 0;
      const currentRemain = parseFloat(trip.remain_cash) || 0;
      
      // Calculate new values
      const newReceived = currentReceived + amount;
      const newRemain = Math.max(0, currentRemain - amount); // Ensure remain doesn't go below 0
      
      // Send update to backend
      const updatedTrip = await putData("dashboard/transport?action=edit", {
        id: tripId,
        total_received_cash: newReceived,
        remain_cash: newRemain,
        // payment_amount: amount
      });
      
      
      // Add a note about the payment

      const newNote = {
        trip_id: tripId,
        driver_id: id,
        note: `تم استلام دفعة بقيمة ${amount} جنيه`,
      };
      

      // Add a note about the payment - get the full response from server
      const noteResponse = await postData(`dashboard/drivers/${id}?action=add`, newNote)

      // Format the timestamp for the new note
      const formattedNote = {
        ...noteResponse.newNote,
        timestamp: new Date(noteResponse.newNote.createdAt).toLocaleString("ar-EG", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      }

      // Update the notes in the trip
      setTrips(
        trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                total_received_cash: newReceived, 
              remain_cash: newRemain,
                trip_notes: [...t.trip_notes, formattedNote],
              }
            : t,
        ),
      )

      

      setMessage(`تم تسجيل الدفعة بنجاح`);
      setTimeout(() => setMessage(""), 3000);
      
      // Reset the editing state
      setEditingPaymentId(null);
      setPaymentAmount("");
      
      
    } catch (error) {
      console.error("Error updating payment", error);
      setErrMessage(error.message || "حدث خطأ أثناء تحديث الدفعة");
      setTimeout(() => setErrMessage(""), 3000);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4 justify-content-between">
        {/* Header on the left */}
        <h1 className="h4 mb-0 text-white">سجل رحلات السائق</h1>
        {/* Button on the right */}
        <Button
          variant="light"
          className="me-2"
          onClick={() => navigate(-1)}
        >
          <FaArrowLeft /> العودة
        </Button>
      </div>
      
      <Card className="mb-4">
        <Card.Header style={{ backgroundColor: "#71483c", color: "white" }}>
          <Card.Title>بيانات السائق</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaUser className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">اسم المندوب</p>
                  <p className="fw-medium"> {driver.leader_name} </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaUser className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">اسم السائق</p>
                  <p className="fw-medium">{driver.driver_name}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaPhone className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">رقم التليفون</p>
                  <p className="fw-medium">{driver.phone_number}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaIdCard className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">الرقم القومي</p>
                  <p className="fw-medium">{driver.national_id}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaFileAlt className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">رقم الجواز</p>
                  <p className="fw-medium">{driver.passport_number}</p>
                </div>
              </div>
            </div>
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaBriefcase className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">الشركة</p>
                  <p className="fw-medium">{driver.company}</p>
                </div>
              </div>
            </div>
						<div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaTruck className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">عدد الرحلات</p>
                  <p className="fw-medium">{driver.trip_counter}</p>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      
      <h2 className="h4 mb-3 text-white">الرحلات الأخيرة</h2>
      
      <div className="mb-4">
        {trips.map(trip => (
          <Card key={trip.id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-start" style={{ backgroundColor: "#71483c", color: "white" }}>
              <div>
                <Card.Title className="h5 mb-1">
                  {trip.loading_place} إلى {trip.destination}
                </Card.Title>
                <div className="d-flex gap-2 text-muted small">
                  <span className="d-inline-flex align-items-center" style={{ color: "white" }} >
                    <FaCalendarAlt className="me-1" size={12} /> 
                    تاريخ التحميل للشركة: {trip.company_loading_date}
                  </span>
                  <span className="d-inline-flex align-items-center" style={{ color: "white" }} >
                    <FaCalendarAlt className="me-1" size={12} /> 
                    تاريخ التعتيق: {trip.aging_date}
                  </span>
                </div>
              </div>
              <Badge bg="secondary">{trip.fo_number}</Badge>
            </Card.Header>
            
            <Card.Body>
              <Tab.Container defaultActiveKey="trip-details">
                <Nav variant="tabs" className="mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="trip-details">تفاصيل الرحلة</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="vehicle-details">بيانات المركبة</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="financial-details">البيانات المالية</Nav.Link>
                  </Nav.Item>
                  {userRole === "manager" && (
                    <Nav.Item>
                      <Nav.Link eventKey="company-details">بيانات الشركة المالية</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
                
                <Tab.Content>
                  <Tab.Pane eventKey="trip-details">
                    <div className="row g-3 mt-2">
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">نوع الحمولة</p>
                        <p className="fw-medium">{trip.cargo_type}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">المعدة</p>
                        <p className="fw-medium">{trip.equipment}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">اسم العميل</p>
                        <p className="fw-medium">{trip.client_name}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">تاريخ التحميل للسائق</p>
                        <p className="fw-medium">{trip.driver_loading_date}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">تاريخ الوصول</p>
                        <p className="fw-medium">{trip.arrival_date}</p>
                      </div>
											<div className="col-md-4">
                        <p className="text-muted small mb-0">حالة الرحلة</p>
                        <p className="fw-medium">{trip.status}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">اضافة بواسطة</p>
                        <p className="fw-medium">{trip.added_by}</p>
                      </div>
											<div className="col-md-4">
                        <p className="text-muted small mb-0">اخر تعديل بواسطة</p>
                        <p className="fw-medium">{trip.edited_by}</p>
                      </div>
                    </div>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="vehicle-details">
                    <div className="row g-3 mt-2">
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">نوع السيارة</p>
                        <p className="fw-medium">{trip.car_type}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">حروف وأرقام السيارة</p>
                        <p className="fw-medium">{trip.car_letters} {trip.car_numbers}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">حروف وأرقام المقطورة</p>
                        <p className="fw-medium">{trip.trailer_letters} {trip.trailer_numbers}</p>
                      </div>
                    </div>
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="financial-details">
                    <div className="row g-3 mt-2">
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">عدد البياتات</p>
                        <p className="fw-medium">{trip.nights_count}</p>
                      </div>
											<div className="col-md-4">
                        <p className="text-muted small mb-0">أقصى عدد بياتات</p>
                        <p className="fw-medium">{trip.nights_max}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">قيمة البياتة</p>
                        <p className="fw-medium">{trip.night_value} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">إجمالي قيمة البياتات</p>
                        <p className="fw-medium">{trip.total_nights_value} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">ناوُلون</p>
                        <p className="fw-medium">{trip.transport_fee} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">مصاريف (كارتة + ميزان)</p>
                        <p className="fw-medium">{trip.expenses} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">إجمالي النقلة</p>
                        <p className="fw-medium">{trip.total_transport} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">إجمالي النقدية المستلمة</p>
                        <p className="fw-medium">{trip.total_received_cash} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">المتبقى</p>
                        <p className="fw-medium">{trip.remain_cash} جنيه</p>
                      </div>
                    {/* Payment Button/Input Field */}
                    <div className="col-12 mt-3">
                        {editingPaymentId === trip.id ? (
                          <div className="d-flex align-items-center gap-2">
                            <Form.Control
                              type="number"
                              placeholder="أدخل المبلغ"
                              value={paymentAmount}
                              onChange={(e) => setPaymentAmount(e.target.value)}
                              min="1"
                              step="0.01"
                              className="w-auto"
                            />
                            <Button 
                              variant="success" 
                              size="sm"
                              onClick={() => submitPayment(trip.id)}
                            >
                              <FaCheck /> تأكيد
                            </Button>
                            <Button 
                              variant="secondary" 
                              size="sm"
                              onClick={cancelEditingPayment}
                            >
                              <FaTimes /> إلغاء
                            </Button>
                          </div>
                        ) : (
                          <Button 
                            variant="primary" 
                            size="sm"
                            onClick={() => startEditingPayment(trip.id)}
                            disabled={parseFloat(trip.remain_cash) <= 0}
                          >
                            <FaMoneyBillWave className="me-1" /> تسجيل دفعة جديدة
                          </Button>
                        )}
                      </div>
                    </div>
                  </Tab.Pane>
                  {userRole === "manager" && (
                    <>
                    <Tab.Pane eventKey="company-details">
                      <div className="row g-3 mt-2">
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">قيمة البياتة للشركة</p>
                        <p className="fw-medium">{trip.company_night_value} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">إجمالي البياتات للشركة</p>
                        <p className="fw-medium">{trip.total_company_nights_value} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">ناولون الشركة</p>
                        <p className="fw-medium">{trip.company_naulon} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">حساب الكارتة للشركة</p>
                        <p className="fw-medium">{trip.company_toll_fee} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">الحساب الاجمالي للشركة</p>
                        <p className="fw-medium">{trip.total_company_account} جنيه</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">صافي الربح</p>
                        <p className="fw-medium">{trip.net_profit} جنيه</p>
                      </div>
                    </div>
                 </Tab.Pane>
                  </>
                    )}
                </Tab.Content>
              </Tab.Container>
            </Card.Body>
            
            <Card.Footer className="bg-white">
              <Accordion>
                <Accordion.Item eventKey={trip.id}>
                  <Accordion.Header>
                    {expandedTrip === trip.id ? "إخفاء الملاحظات" : `عرض الملاحظات (${trip.trip_notes.length})`}
                  </Accordion.Header>
                  <Accordion.Body>
										{trip.trip_notes.length > 0 ? (
											<div className="mb-3">
												{trip.trip_notes.map(note => (
													<div key={note.id} className="p-3 bg-light rounded mb-2 d-flex justify-content-between align-items-center">
														{/* Note Content */}
														<div>
															<p className="small mb-1">{note.note}</p>
															<div className="d-flex justify-content-start gap-3 text-muted small">
																<span>🕒 {note.timestamp}</span>
																<span>🖊️ بواسطة {note.added_by || "غير معروف"}</span>
															</div>
														</div>
														
														{/* Delete Button (Aligned Right) */}
														<Button onClick={() => deleteNote(note.id, trip.id)} className="del-button" variant="danger" size="sm">حذف</Button>
													</div>
												))}
											</div>
										) : (
											<p className="small text-muted mb-3">لا توجد ملاحظات لهذه الرحلة حتى الآن.</p>
										)}

										{/* Add New Note Section */}
										<div className="d-flex gap-2">
											<Form.Control
												as="textarea"
												placeholder="أضف ملاحظة حول هذه الرحلة خاصة بالسائق..."
												className="small"
												value={newNote}
												onChange={(e) => setNewNote(e.target.value)}
												style={{ height: '80px' }}
											/>
											<Button onClick={() => addNote(trip.id)} className="align-self-start">إضافة</Button>
										</div>
									</Accordion.Body>

                </Accordion.Item>
              </Accordion>
            </Card.Footer>
          </Card>
        ))}
      </div>
      
     
    </div>
  );
};

export default DriverProfile;
