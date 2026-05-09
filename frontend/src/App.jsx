import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import Settings from './components/Settings.jsx';
import Search from './components/Search.jsx';
import Admin from './components/Admin.jsx';
import ByPassLogin from './components/AdminByPassLogin.jsx';
import Watchlist from './components/Watchlist.jsx';
import MovieRequest from './components/MovieRequest.jsx';

export default function App(){
    return (
    <>
        <Routes>
            <Route path='/watchlist' element={<Watchlist/>} />
            <Route path='/adminpage' element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/adminlogin" element={<ByPassLogin />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movierequest" element={<MovieRequest />} />
            {/*
            <Route path="/recommendations" element={<Recommendations />} />
            <Route path="/movie_detail" element={<MovieDetail/>} />
            <Route path="/review_rating" element={<ReviewRating />} />
            <
            */}
        </Routes>
    </>
    );
};
