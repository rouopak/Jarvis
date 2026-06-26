import { socialImgs } from "../constants";

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="flex flex-col justify-center">
                    <p>Terms & Conditions</p>
                </div>
                <div className="socials">
                    {socialImgs.map((socialImg, index) => (
                        <a
                            key={index}
                            href={socialImg.link}
                            target="_blank"
                            rel="noreferrer"
                            className="icon"
                        >
                            <img
                                src={socialImg.imgPath}
                                alt={socialImg.name}
                                className={
                                    socialImg.name === "linkedin"
                                        ? "w-[22px] h-[22px] object-contain"
                                        : "w-[18px] h-[18px] object-contain"
                                }
                            />
                        </a>
                    ))}
                </div>
                <div className="flex flex-col justify-center">
                    <p className="text-center md:text-end">
                        © {new Date().getFullYear()} Rupak Sharma. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
