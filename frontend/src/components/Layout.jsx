import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import React, { useContext } from 'react';
import { UserContext } from './User';

export default function Layout({ children }) {
    const { user, setUser } = useContext(UserContext);
    const isLoggedIn = (aUser) => {
        return (
            aUser !== null &&
            aUser !== undefined &&
            Object.keys(aUser).length > 0
        );
    };
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    const navLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link'

    const logOut = () => {
        if (window.confirm("Do you wish to Log Out?")) {
            localStorage.removeItem("token");
            setUser(null);
            navigate("/");
        }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <header>
                <Navbar expand="lg" data-bs-theme="dark">
                    <Container fluid>
                        <Navbar.Brand as={NavLink} to="/">WatchVault</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                <Nav.Link as={NavLink} to="/watchlist" className={navLinkClass}>Watchlist</Nav.Link>
                                <Nav.Link as={NavLink} to="/recommendations" className={navLinkClass}>Recommendations</Nav.Link>
                                <Nav.Link as={NavLink} to="/create_review" className={navLinkClass}>Write a Review</Nav.Link>
                                {!isLoggedIn(user) ? (
                                    <Nav.Link as={NavLink} to="/login" className={navLinkClass}>Login</Nav.Link>
                                ) : (
                                    <Nav.Link as={NavLink} to="/settings" className={navLinkClass}>{user?.username}</Nav.Link>
                                )}
                                {user?.role === 'admin' && (
                                    <Nav.Link as={NavLink} to="/adminpage" className={navLinkClass}>Admin Controls</Nav.Link>
                                )}
                                {isLoggedIn(user) && (
                                    <Nav.Link onClick={logOut}>
                                        Logout
                                    </Nav.Link>
                                )}
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>
            <main style={{ flex: 1 }}>
                {children}
            </main>
            <footer>
                <Container>
                    <Row>
                        <Col sm={6}>
                            <p>©Team AL_10</p>
                        </Col>
                        <Col sm={6} >
                            <p className="back-to-top" onClick={scrollToTop}>
                                Back to top
                            </p>
                        </Col>
                    </Row>
                </Container>
            </footer>
    </div>
    );
};
