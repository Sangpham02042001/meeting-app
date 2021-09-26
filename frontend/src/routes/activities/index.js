import React from 'react'
import ActivityList from '../../components/ActivityList'

export default function Activities() {
  return (
    <>
      <div className="layout-leftside-list">
        <ActivityList />
      </div>
      <div className="layout-rightside-content">
        <h2>Content</h2>
      </div>
    </>
  )
}
