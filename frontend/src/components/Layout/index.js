import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import Navbar from '../Navbar'
import './layout.css'

export default function Layout({ children }) {

  return (
    <>
      <Navbar />
      <div className="layout">
        <div className="list-selection">
          <div className="btn-list-selection">
            <NavLink exact to='/' activeClassName="btn-active">
              <button className="btn-default" >Home</button>
            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to="/activities" activeClassName="btn-active">
              <button className="btn-default" >Activity</button>
            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/friends' activeClassName="btn-active">
              <button className="btn-default" >Chat</button>
            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/teams' activeClassName="btn-active">
              <button className="btn-default"> Teams</button>
            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/setting' activeClassName="btn-active">
              <button className="btn-default" >Setting</button>
            </NavLink>
          </div>
        </div>
        {children}
      </div>
    </>
  )
}
