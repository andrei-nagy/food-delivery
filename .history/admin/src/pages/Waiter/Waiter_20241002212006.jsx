import React, { useEffect, useState } from 'react'
import './Waiter.css'
import axios from "axios"
import { toast } from "react-toastify"
import { assets } from '../../../../frontend/src/assets/assets'
import { useRef } from 'react'

export const Waiter = ({url}) => {


  const [list, setList] = useState([]);
  const [prevListLength, setPrevListLength] = useState(0); // Stocăm lungimea anterioară a listei pentru a compara
  const audioRef = useRef(null); // Referință la elementul audio pentru a reda sunetul



  // Funcția de preluare a listei de comenzi
  const fetchList = async () => {
    const response = await axios.get(`${url}/api/waiterorders/listwaiterrequests`);
    console.log(response.data);
    if (response.data.success) {
      const newList = response.data.data;
      
      // Comparăm dacă lungimea listei s-a schimbat
      if (newList.length > prevListLength) {
        // Redăm sunetul de notificare dacă există o nouă înregistrare
        if (audioRef.current) {
          audioRef.current.play();
        }
        toast.success("New waiter request received!");
      }

      // Actualizăm starea listei și lungimea anterioară
      setList(newList);
      setPrevListLength(newList.length);
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
  }, []);

  // Handler pentru schimbarea statusului (opțional)
  const statusHandler = (event, id) => {
    // Implementarea handlerului pentru schimbarea statusului
  }


 
  return (
    <div className='list add flex-col order-item'>
      <p>Waiter Requests</p>
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
           
              <select onChange={(event) => statusHandler(event, order._id)} value={item.status}>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
             
            </select>
              {/* <p onClick={() => removeFoodCategory(item._id)} className='cursor'>X</p> */}
            </div>
          )
        })}
      </div>

      {/* Elementul audio pentru sunetul de notificare */}
      <audio ref={audioRef} src={assets.notification_sound} preload="auto" />
    </div>
  )
}


export default Waiter