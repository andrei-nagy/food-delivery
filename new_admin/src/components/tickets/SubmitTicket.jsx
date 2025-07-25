import React, { useRef, useState } from "react";
import { Button, Input, Textarea, Typography } from "@material-tailwind/react";
import emailjs from 'emailjs-com';
import { setAppVersion } from "../context/AppVersionContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export function SubmitTicketPage() {
    const form = useRef();
    const [notification, setNotification] = useState('');
    const appVersion = setAppVersion();


    const sendEmail = (e) => {
        e.preventDefault();

        emailjs.sendForm('service_d722x3s', 'template_vdxgeu8', form.current, 'Rw7daoMmQiW-EUsnH')
            .then((result) => {
                console.log(result.text);
                // Clear form fields
                form.current.reset();
                // Set notification message
                toast.success('Request submitted successfully', {theme: "dark"});
            }, (error) => {
             toast.error(error, {theme: "dark"})
            });
    };


    return (
        <section className="bg-white dark:bg-gray-900 rounded-lg">
            <div className="container px-6 py-12 mx-auto">
                <div>
                    <p className="font-medium text-blue-500 dark:text-blue-400">Submit a Support Request</p>
                    <h1 className="mt-2 text-2xl font-semibold text-gray-800 md:text-3xl dark:text-white">Contact Our Support Team</h1>
                    <p className="mt-3 text-gray-500 dark:text-gray-400">Having trouble with the Orderly app? Let us know what’s going on, and we’ll get back to you shortly.</p>
                </div>

                <div className="grid grid-cols-1 gap-12 mt-10 lg:grid-cols-3">
                    {/* Coloană mică pentru informațiile de contact */}
                    <div className="grid grid-cols-1 gap-12 md:grid-cols-1 lg:col-span-1">
                        <div>
                            <span className="inline-block p-3 text-blue-500 rounded-full bg-blue-100/80 dark:bg-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                </svg>
                            </span>
                            <h2 className="mt-4 text-base font-medium text-gray-800 dark:text-white">Email</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Our friendly team is here to assist with any inquiries you may have</p>
                            <p className="mt-2 text-sm text-blue-500 dark:text-blue-400">contact.orderlyapp@gmail.com</p>
                        </div>

                        <div>
                            <span className="inline-block p-3 text-blue-500 rounded-full bg-blue-100/80 dark:bg-gray-800">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                </svg>
                            </span>
                            <h2 className="mt-4 text-base font-medium text-gray-800 dark:text-white">Phone</h2>
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Available Monday to Friday, 8:00 AM - 5:00 PM.</p>
                            <p className="mt-2 text-sm text-blue-500 dark:text-blue-400">+40 771-486-918</p>
                        </div>
                    </div>

                    {/* Coloană mare pentru formular */}
                    <div className="lg:col-span-2 p-4 py-6 rounded-lg bg-gray-100 dark:bg-gray-800 md:p-8">
                    <form ref={form} onSubmit={sendEmail}>
    <div className="-mx-2 md:items-center md:flex">
        <div className="flex-1 px-2">
            <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">First Name</label>
            <input name="name" type="text" placeholder="John" className="block w-full px-5 py-2.5 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
        </div>

        <div className="flex-1 px-2 mt-4 md:mt-0">
            <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Last Name</label>
            <input name="restaurant_name" type="text" placeholder="Doe" className="block w-full px-5 py-2.5 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
        </div>
    </div>

    <div className="mt-4">
        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Email Address</label>
        <input name="email" type="email" placeholder="We’ll use this email to keep you updated on the status of your ticket." className="block w-full px-5 py-2.5 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" />
    </div>

    <div className="mt-4">
        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Severity</label>
        <select name="severity" className="block w-full px-5 py-2.5 mt-2 text-gray-700 bg-white border border-gray-200 rounded-lg dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
        </select>
    </div>

    <div className="w-full mt-4">
        <label className="block mb-2 text-sm text-gray-600 dark:text-gray-200">Message</label>
        <textarea name="message" className="block w-full h-32 px-5 py-2.5 mt-2 text-gray-700 placeholder-gray-400 bg-white border border-gray-200 rounded-lg md:h-56 dark:placeholder-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700 focus:border-blue-400 dark:focus:border-blue-400 focus:ring-blue-400 focus:outline-none focus:ring focus:ring-opacity-40" placeholder="Please describe the issue you’re facing in as much detail as possible so we can assist you effectively."></textarea>
    </div>

    <div className="w-full mt-4">
        <input name="app_version" type="hidden" value={appVersion} /> {/* Use value attribute here */}
    </div>

    <button className="w-full px-6 py-2.5 mt-4 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-blue-500 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-400 focus:ring-opacity-50">
        Send Request
    </button>
</form>

                    </div>
                </div>
            </div>
        </section>


    );
}

export default SubmitTicketPage;