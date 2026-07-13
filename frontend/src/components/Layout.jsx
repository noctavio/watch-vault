import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';
import { useContext } from 'react';
//import { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext.jsx';

export default function Layout({ children }) {
    const navLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';
    const navigate = useNavigate();
    const {user, setUser} = useContext(UserContext);

    // user should be storing a token... how do we verify if they're logged in just that it exists? So that we dynamically render Login/Logout
    // I think we also give logout functionality here by clearing the token should the user logout?

    const handleLogout = () => {
        setUser(null);
        navigate("/")
    }

    return (
        <div className="bar-and-footer">
            <header>
                <Navbar expand="lg" data-bs-theme="dark">
                    <Container fluid>
                        <Navbar.Brand as={NavLink} to="/">WatchVault</Navbar.Brand>
                        <Navbar.Toggle aria-controls="basic-navbar-nav" />
                        <Navbar.Collapse id="basic-navbar-nav">
                            <Nav className="ms-auto">
                                <Nav.Link as={NavLink} to="/watchlist" className={navLinkClass}>Watchlist</Nav.Link>
                                <Nav.Link as={NavLink} to="/settings" className={navLinkClass}>Profile</Nav.Link>
                                {user ? (<Nav.Link onClick={handleLogout}> Logout </Nav.Link>) : 
                                        (<Nav.Link as={NavLink} to="/login" className={navLinkClass}>Login</Nav.Link>) }
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
                        <Col sm={6}>
                            <p className="back-to-top">Back to top</p>
                        </Col>
                    </Row>
                </Container>
            </footer>
        </div>
    );
}