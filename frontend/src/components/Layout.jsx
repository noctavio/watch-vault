import { Container, Navbar, Nav, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';

export default function Layout({ children }) {
    const navLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

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
                                <Nav.Link as={NavLink} to="/login" className={navLinkClass}>Login</Nav.Link>
                                <Nav.Link as={NavLink} to="/settings" className={navLinkClass}>Settings</Nav.Link>
                                <Nav.Link as={NavLink} to="/adminpage" className={navLinkClass}>Admin Controls</Nav.Link>
                                <Nav.Link as={NavLink} to="/">Logout</Nav.Link>
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