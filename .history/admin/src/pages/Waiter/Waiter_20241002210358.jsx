import React, { useEffect, useState } from 'react'
import './Waiter.css'
import axios from "axios"
import { toast } from "react-toastify"

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
      <p>All Food Categories List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Menu Name</b>
          <b>Description</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/` + item.image} alt="" />
              <p>{item.menu_name}</p>
              <p>{item.description}</p>
              <p onClick={() => removeFoodCategory(item._id)} className='cursor'>X</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}


export default Waiter