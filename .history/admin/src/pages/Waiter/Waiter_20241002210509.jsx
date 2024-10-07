import React, { useEffect, useState } from 'react'
import './Waiter.css'
import axios from "axios"
import { toast } from "react-toastify"
import { assets } from '../../../../frontend/src/assets/assets'

export const Waiter = ({url}) => {


  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/waiterorders/list`);
    console.log(response.data);
    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error("Error")
    }
  }

   

  useEffect(() => {
    fetchList();
  }, [])


  return (
    <div className='list add flex-col'>
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
              <p>{item.status}</p>
              {/* <p onClick={() => removeFoodCategory(item._id)} className='cursor'>X</p> */}
            </div>
          )
        })}
      </div>
    </div>
  )
}


export default Waiter