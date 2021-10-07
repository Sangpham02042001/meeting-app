import React, {useEffect} from 'react'
import { useDispatch } from 'react-redux'
import { Link, NavLink } from 'react-router-dom'
import { getNotifs } from '../../store/reducers/notification.reducer'
import Navbar from '../Navbar'
import './layout.css'

export default function Layout({ children }) {
  // const dispatch = useDispatch()
  
  return (
    <>
      <Navbar />
      <div className="layout">
        <div className="list-selection">
          <div className="btn-list-selection">
            <NavLink exact to='/' activeClassName="btn-active">
              <button className="btn-default" ><i className="fas fa-home"></i></button>
            </NavLink>
          </div>
          {/* <div className="btn-list-selection">
            <NavLink to="/activities" activeClassName="btn-active">
              <button className="btn-default" >Activity</button>
            </NavLink>
          </div> */}
          <div className="btn-list-selection">
            <NavLink to='/conversations' activeClassName="btn-active">
              <button className="btn-default" ><i className="fas fa-comment-dots"></i></button>

            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/teams' activeClassName="btn-active">
              <button className="btn-default"><i className="fas fa-users"></i></button>
            </NavLink>
          </div>
          <div className="btn-list-selection">
            <NavLink to='/setting' activeClassName="btn-active">
              <button className="btn-default" ><i className="fas fa-cog"></i></button>
            </NavLink>
          </div>
        </div>
        <div className="content-layout">
          {children}
        </div>
      </div>
    </>
  )
}
