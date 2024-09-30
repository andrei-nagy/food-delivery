import React from 'react'

const App = () => {
  return (
    <div>
        <Navbar></Navbar>
        <hr></hr>
        <div className="app-content">
            <Sidebar/>
        </div>
    </div>
  )
}

export default App