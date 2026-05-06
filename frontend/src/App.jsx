import { Routes, Route } from 'react-router-dom'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import Settings from './components/Settings.jsx';

export default function App(){
    return (
    <>
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/" element={<Home />} />
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
