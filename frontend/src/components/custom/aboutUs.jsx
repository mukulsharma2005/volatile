import React from 'react';
import { Plus } from "lucide-react";

const AboutUs = ({ selected, setSelected }) => {
    return (
        // The outer div remains exactly as requested, assuming 'theme-bg' is your blackish-gray color:
        <div className={`w-full lg:w-2/5 h-[100dvh] flex flex-col overflow-y-auto hide-scroll absolute top-0 z-40 box-border theme-bg ${selected!="aboutUs" && "hidden" }`}>
            
            {/* 1. HEADER: Styled for the dark theme */}
            <header className="p-4 border-b border-gray-700 flex items-center justify-between sticky top-0 theme-bg z-10 shadow-lg">
                <h1 className="text-xl font-bold text-white">About The Project 💡</h1>
                <Plus 
                    // Icon color and hover adjusted for a dark background
                    className='rotate-45 w-8 h-8 p-1 rounded-full text-white hover:bg-gray-700 cursor-pointer transition-colors' 
                    onClick={() => setSelected("")} 
                />
            </header>

            {/* 2. MAIN CONTENT: Text and sections styled for dark theme */}
            <div className="p-6 space-y-8 text-white text-base">
                
                {/* Developer's Message Section */}
                <section className="space-y-3">
                    <p className="font-semibold text-gray-300">
                        Greetings from the Developer and Designer!
                    </p>
                    <p className="text-sm text-gray-400">
                        I am the sole creator of this site, responsible for both the visual aesthetics and the underlying code. This project is a demonstration of **modern full-stack development** and real-time capability.
                    </p>
                    <p className="text-sm text-gray-400">
                        The aim was to build a fast, responsive, and functional application using a robust set of tools, detailed below.
                    </p>
                </section>
                
                <hr className="border-t border-gray-700" />

                {/* Technology Stack Section */}
                <section className="space-y-4">
                    <h2 className="text-lg font-bold border-b pb-2 border-gray-700">Technology Stack ⚙️</h2>

                    {/* Frontend */}
                    <div>
                        <h3 className="text-base font-semibold text-cyan-400 mb-2">Frontend</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                            <li>**React**: The core library for the dynamic user interface.</li>
                            <li>**Tailwind CSS**: Utility-first framework for rapid styling.</li>
                            <li>**Redux**: For global and predictable state management.</li>
                            <li>**Shadcn UI**: Provides accessible and reusable UI components.</li>
                            <li>**Socket.IO Client**: Handles real-time, bi-directional communication.</li>
                        </ul>
                    </div>
                    
                    {/* Backend */}
                    <div>
                        <h3 className="text-base font-semibold text-lime-400 mb-2">Backend</h3>
                        <ul className="list-disc list-inside space-y-1 text-sm text-gray-400 ml-4">
                            <li>**Node** & **Express**: The runtime environment and framework for the API server.</li>
                            <li>**Socket.IO**: Powers the real-time functionality (e.g., chat).</li>
                            <li>**JWT**: Secure, stateless authentication via tokens.</li>
                            <li>**Mongoose**: MongoDB Object Data Modeling (ODM).</li>
                            <li>**Cloudinary** & **Multer**: Used for efficient file handling and storage.</li>
                        </ul>
                    </div>
                    
                    {/* Database */}
                    <div>
                        <h3 className="text-base font-semibold text-amber-400 mb-2">Database</h3>
                        <p className="text-sm text-gray-400 ml-4">**MongoDB**: A flexible NoSQL database solution.</p>
                    </div>
                </section>
                <footer>
                    <div className='text-gray-600 text-sm text-center'>Designed and developed By Mukul Sharma</div>
                </footer>
            </div>
        </div>
    )
}
export default AboutUs