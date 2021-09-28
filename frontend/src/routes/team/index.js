import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams, Link } from 'react-router-dom'
import { Container } from 'react-bootstrap'
import { getTeamInfo } from '../../store/reducers/team.reducer'
import Loading from '../../components/Loading'
import './team.css'
import TeamHeader from '../../components/TeamHeader'

export default function Team(props) {
  const { teamId } = useParams()
  const teamReducer = useSelector(state => state.teamReducer)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(getTeamInfo({ teamId }))
  }, [teamId])
  return (
    teamReducer.loading ? <Loading />
      :
      <Container fluid style={{ padding: 0 }}>
        <TeamHeader />
      </Container>
  )
}
