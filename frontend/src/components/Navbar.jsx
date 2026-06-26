import { useEffect, useState } from "react";
import { navLinks } from '../constants/index.js'

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const isScrolled = window.scrollY > 10;
            setScrolled(isScrolled);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const handleLinkClick = (e, targetId) => {
        e.preventDefault();
        const target = document.getElementById(targetId);
        if (target) {
            const offset = window.innerHeight * 0.15;
            const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top, behavior: "smooth" });
        }
    };

    return (
        <header className={`navbar ${scrolled ? "scrolled" : "not-scrolled"}`}>
            <div className="inner">
                <a className='logo' href="#hero" onClick={(e) => handleLinkClick(e, "hero")}>JarvisAi</a>
                <nav className="desktop">
                    <ul>
                        {navLinks.map(({ link, name }) => (
                            <li key={name} className="group">
                                <a href={link} onClick={(e) => handleLinkClick(e, link.substring(1))}>
                                    <span>{name}</span>
                                    <span className="underline" />
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
                <a href="#contact" onClick={(e) => handleLinkClick(e, "contact")} className="contact-btn group">
                    <div className='inner'>
                        <span>
                            Let's Connect
                        </span>
                    </div>
                </a>
            </div>
        </header>
    )
}

export default Navbar;
