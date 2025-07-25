import React, { useEffect, useState, useRef } from 'react';
import './Waiter.css';
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from '../../../../frontend/src/assets/assets';

export const Waiter = ({ url }) => {
  const [list, setList] = useState([]);
  const [newRequests, setNewRequests] = useState([]); // Stocăm cererile noi pentru a aplica stilul
  const audioRef = useRef(null); // Referință la elementul audio pentru a reda sunetul

  // Funcția de preluare a listei de comenzi
  const fetchList = async () => {
    const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
 
    if (response.data.success) {
      const newList = response.data.data;

      // Verificăm dacă există modificări în listă
      if (JSON.stringify(newList) !== JSON.stringify(list)) {
        // Verificăm cererile noi
        const pendingRequests = newList.filter(item => item.status === 'Pending');
        const completedRequests = newList.filter(item => item.status === 'Completed');

        // Actualizăm cererile noi
        setNewRequests(pendingRequests.filter(item => !list.includes(item)));

        // Redăm sunetul de notificare
        if (audioRef.current) {
          audioRef.current.play().catch(error => {
            console.log('Sound play blocked by browser:', error);
          });
        }

        toast.success("New waiter request received!");
        setList(newList); // Actualizăm lista doar dacă s-a schimbat
      }
    } else {
      toast.error("Error");
    }
  };

  // Facem polling la fiecare 5 secunde
  useEffect(() => {
    fetchList(); // Prima cerere imediat ce componenta e montată

    const intervalId = setInterval(() => {
      fetchList();
    }, 5000); // Polling la fiecare 5 secunde

    return () => clearInterval(intervalId); // Curățăm intervalul la demontare
  }, [list]); // Adăugăm `list` în dependency array pentru a verifica lista la fiecare actualizare

  // Handler pentru schimbarea statusului (opțional)
  const statusHandler = async (event, orderId) => {
    const response = await axios.post(url + "/api/waiterorders/status", {
      orderId,
      status: event.target.value
    });
   
    if(response.data.success){
      toast.success("Status updated successfully.")
      // Fetch updated list or any other logic after status update
      await fetchList();
    } else {
      toast.error("Error");
    }
  };

  return (
    <div className='list add flex-col order-item'>
      <p>Waiter Requests</p>
      <div className="list-table-waiter">
        {/* <div className="list-table-format title">
          <b>Image</b>
          <b>Action</b>
          <b>Table No</b>
          <b>Status</b>
        </div> */}

        {/* Afișăm cererile Pending */}
        {list
          .filter(item => item.status === 'Pending')
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sortare descrescătoare
          .map((item) => (
            <div key={item._id} className={`waiter-item pending ${newRequests.includes(item) ? 'new-request' : ''}`}>
              <img src={assets.parcel_icon} alt="" />
              <p>Action : <b>{item.action}</b></p>
              <p>Table No: <b>{item.tableNo}</b></p>
              <select onChange={(event) => statusHandler(event, item._id)} value={item.status}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ))}

        {/* Afișăm cererile Completed */}
        {list
          .filter(item => item.status === 'Completed')
          .sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn)) // Sortare descrescătoare
          .map((item) => (
            <div key={item._id} className="waiter-item completed">
              <img src={assets.parcel_icon} alt="" />
              <p>Action : <b>{item.action}</b></p>
              <p>Table No: <b>{item.tableNo}</b></p>
              <select onChange={(event) => statusHandler(event, item._id)} value={item.status}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ))}
      </div>

      <audio ref={audioRef} src={assets.notification_sound} preload="auto" />
    </div>
  );
}

export default Waiter;
