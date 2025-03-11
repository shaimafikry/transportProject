import { useEffect, useState } from "react";
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
} from "react-icons/fa";
import { fetchData, putData } from "../api";
import { useParams } from "react-router-dom";

const DriverProfile = () => {
  const { id } = useParams();
  const [driver, setDriver] = useState({});
  const [trips, setTrips] = useState([]);
  const [expandedTrip, setExpandedTrip] = useState(null);
  const [newNote, setNewNote] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const fetchDriver = async () => {
    try {
      const { driver, trips } = await fetchData(`dashboard/${id}`);
      if (!driver) {
        setMessage("لا يوجد بيانات لهذا السائق");
        return;
      }
      if (!trips) {
        setMessage("لا يوجد رحلات لهذا السائق");
        return;
      }
      setDriver(driver);
      setTrips(trips);
    } catch (error) {
      console.error("Error fetching driver data", error);
      setErrMessage(error.message);
    }
  };

  useEffect(() => {
    fetchDriver();
  }, [id]);

  const toggleExpand = (tripId) => {
    setExpandedTrip(expandedTrip === tripId ? null : tripId);
  };

  const addNote = async (tripId) => {
    if (newNote.trim() === "") return;
    try {
      const data = await putData(`dashboard/${tripId}`, {
        note: newNote,
        timestamp: new Date().toLocaleString("ar-EG", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        }),
      });
      const updatedTrips = trips.map((trip) =>
        trip.id === tripId
          ? {
              ...trip,
              trip_notes: [
                ...trip.trip_notes,
                {
                  id: `n${Date.now()}`,
                  content: newNote,
                  timestamp: data.timestamp || new Date().toLocaleString("ar-EG"),
                },
              ],
            }
          : trip
      );
      setTrips(updatedTrips);
      setNewNote("");
    } catch (error) {
      console.error("Error adding note", error);
      setErrMessage(error.message);
    }
  };
  return (
    <div className="container py-4">
      <div className="d-flex align-items-center mb-4">
        <Button variant="light" className="me-2">
          <FaArrowLeft />
        </Button>
        <h1 className="h3 mb-0">سجلات رحلات السائق</h1>
      </div>
      
      <Card className="mb-4">
        <Card.Header>
          <Card.Title>بيانات السائق</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-4 col-lg-4">
              <div className="d-flex align-items-center">
                <FaUser className="text-muted me-2" />
                <div>
                  <p className="text-muted small mb-0">اسم المندوب</p>
                  <p className="fw-medium">{driver.leader_name}</p>
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
          </div>
        </Card.Body>
      </Card>
      
      <h2 className="h4 mb-3">الرحلات الأخيرة</h2>
      
      <div className="mb-4">
        {trips.map(trip => (
          <Card key={trip.id} className="mb-3">
            <Card.Header className="d-flex justify-content-between align-items-start">
              <div>
                <Card.Title className="h5 mb-1">
                  {trip.loading_place} إلى {trip.destination}
                </Card.Title>
                <div className="d-flex gap-2 text-muted small">
                  <span className="d-inline-flex align-items-center">
                    <FaCalendarAlt className="me-1" size={12} />
                    تاريخ التحميل: {trip.driver_loading_date}
                  </span>
                  <span className="d-inline-flex align-items-center">
                    <FaCalendarAlt className="me-1" size={12} />
                    تاريخ الوصول: {trip.arrival_date}
                  </span>
                </div>
              </div>
              <Badge bg="primary">{trip.fo_number}</Badge>
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
                        <p className="text-muted small mb-0">تاريخ التحميل للشركة</p>
                        <p className="fw-medium">{trip.company_loading_date}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">تاريخ التعتيق</p>
                        <p className="fw-medium">{trip.aging_date}</p>
                      </div>
                      <div className="col-md-4">
                        <p className="text-muted small mb-0">بواسطة</p>
                        <p className="fw-medium">{trip.added_by}</p>
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
                        <p className="fw-medium">{trip.nights_count} / {trip.nights_max}</p>
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
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
              
              {trip.notes && (
                <div className="mt-3 p-3 bg-light rounded">
                  <p className="small fw-medium mb-1">ملاحظات:</p>
                  <p className="small">{trip.notes}</p>
                </div>
              )}
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
                          <div key={note.id} className="p-3 bg-light rounded mb-2">
                            <p className="small mb-1">{note.content}</p>
                            <p className="small text-muted">{note.timestamp}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="small text-muted mb-3">لا توجد ملاحظات لهذه الرحلة حتى الآن.</p>
                    )}
                    
                    <div className="d-flex gap-2">
                      <Form.Control
                        as="textarea"
                        placeholder="أضف ملاحظة حول هذه الرحلة..."
                        className="small"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        style={{ height: '80px' }}
                      />
                      <Button onClick={() => addNote(trip.id)} className="align-self-start">
                        <FaPlus className="me-1" size={12} />
                        إضافة
                      </Button>
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
