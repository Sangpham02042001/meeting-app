import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import './home.css';
import Welcome from "../../components/Welcome";
import HomeComponent from "../../components/HomeComponent";
import { isAuthenticated } from '../../store/reducers/user';
import Layout from "../../components/Layout";
import Loading from "../../components/Loading";

const Home = (props) => {
    const userReducer = useSelector(state => state.userReducer)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userReducer.loaded) {
            dispatch(isAuthenticated())
        }
    }, [])

    return (
        !userReducer.loaded ? <Loading /> : (
            userReducer.authenticated ? <Layout>
                <HomeComponent />
            </Layout> : <Welcome />
        )
    );
};

export default Home;