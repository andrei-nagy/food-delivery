import React, { useEffect, useState, useRef } from 'react';
import './Waiter.css';
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from '../../../../frontend/src/assets/assets';

export const Waiter = ({ url }) => {
  const [list, setList] = useState([]);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Starea pentru a urmări dacă audio este activat
  const audioRef = useRef(null); // Referință la elementul audio

  // Funcția de preluare a listei de comenzi
  const fetchList = async () => {
    const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
    console.log(response.data);
    if (response.data.success) {
      const newList = response.data.data;

      // Verificăm dacă există modificări în listă (nu doar lungimea, ci și conținutul)
      if (JSON.stringify(newList) !== JSON.stringify(list)) {
        // Redăm sunetul de notificare dacă lista s-a schimbat și audio este activat
        if (isAudioEnabled && audioRef.current) {
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
  }, [list, isAudioEnabled]); // Adăugăm `isAudioEnabled` în dependency array

  // Handler pentru activarea audio
  const handleAudioEnable = () => {
    setIsAudioEnabled(true);
    // Redăm sunetul imediat pentru a respecta interacțiunea utilizatorului
    if (audioRef.current) {
      audioRef.current.play().catch(error => {
        console.log('Sound play blocked by browser:', error);
      });
    }
  };

  // Handler pentru schimbarea statusului (opțional)
  const statusHandler = (event, id) => {
    // Implementarea handlerului pentru schimbarea statusului
  }

  return (
    <div className='list add flex-col order-item'>
      <p>Waiter Requests</p>
      
      <button onClick={handleAudioEnable}>Activează Sunetul</button> {/* Buton pentru activarea sunetului */}
      
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Action</b>
          <b>Table No</b>
          <b>Status</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={index} className='list-table-format'>
              <img src={assets.parcel_icon} alt="" />
              <p>{item.action}</p>
              <p>{item.tableNo}</p>

              <select onChange={(event) => statusHandler(event, item._id)} value={item.status}>
                <option value="Pending">Pending</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )
        })}
      </div>

      <audio ref={audioRef} src={assets.notification_sound} preload="auto" />
    </div>
  );
}

export default Waiter;
