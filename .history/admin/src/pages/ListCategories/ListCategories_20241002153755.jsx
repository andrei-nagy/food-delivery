import React, { useEffect, useState } from 'react'
import './ListCategories.css'
import axios from "axios"
import { toast } from "react-toastify"

export const ListCategory = ({url}) => {


  const [list, setList] = useState([]);

  const fetchList = async () => {
    const response = await axios.get(`${url}/api/categories/listcategory`);
    console.log(response.data);
    if (response.data.success) {
      setList(response.data.data);
    } else {
      toast.error("Error")
    }
  }

  const removeFoodCategory = async (categoryId) => {
    const response = await axios.post(`${url}/api/categories/removecategory`, { id: categoryId })
    await fetchList();

    if (response.data.success) {
      toast.success(response.data.message)
    } else {
      toast.error(response.data.message)
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