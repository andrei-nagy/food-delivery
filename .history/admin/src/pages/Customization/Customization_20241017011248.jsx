import React, { useEffect } from 'react';
import $ from 'jquery'; // Import jQuery if needed
import 'intl-tel-input/build/css/intlTelInput.css'; // Include the necessary CSS for the phone input
import 'intl-tel-input'; // Import intl-tel-input for phone number formatting
import 'nice-select'; // Import nice-select for styled select
import 'nice-select/dist/nice-select.css'; // Include nice-select CSS

const MultiStepForm = () => {
    useEffect(() => {
        // Initialize the multi-step form, phone number select, and nice select
        verificationForm();
        phoneNoselect();
        nice_Select();
    }, []);

    // Multi-step form verification
    function verificationForm() {
        let animating = false; // Flag to prevent quick multi-click glitches

        $(".next").click(function () {
            if (animating) return false;
            animating = true;

            const current_fs = $(this).parent();
            const next_fs = $(this).parent().next();

            // Activate next step on progress bar using the index of next_fs
            $("#progressbar li").eq($("fieldset").index(next_fs)).addClass("active");

            // Show the next fieldset
            next_fs.show();
            // Hide the current fieldset with style
            current_fs.animate({ opacity: 0 }, {
                step: function (now) {
                    const scale = 1 - (1 - now) * 0.2;
                    const left = (now * 50) + "%";
                    const opacity = 1 - now;
                    current_fs.css({ 'transform': 'scale(' + scale + ')', 'position': 'absolute' });
                    next_fs.css({ 'left': left, 'opacity': opacity });
                },
                duration: 800,
                complete: function () {
                    current_fs.hide();
                    animating = false;
                },
                easing: 'easeInOutBack'
            });
        });

        $(".previous").click(function () {
            if (animating) return false;
            animating = true;

            const current_fs = $(this).parent();
            const previous_fs = $(this).parent().prev();

            // De-activate current step on progress bar
            $("#progressbar li").eq($("fieldset").index(current_fs)).removeClass("active");

            // Show the previous fieldset
            previous_fs.show();
            // Hide the current fieldset with style
            current_fs.animate({ opacity: 0 }, {
                step: function (now) {
                    const scale = 0.8 + (1 - now) * 0.2;
                    const left = ((1 - now) * 50) + "%";
                    const opacity = 1 - now;
                    current_fs.css({ 'left': left });
                    previous_fs.css({ 'transform': 'scale(' + scale + ')', 'opacity': opacity });
                },
                duration: 800,
                complete: function () {
                    current_fs.hide();
                    animating = false;
                },
                easing: 'easeInOutBack'
            });
        });

        $(".submit").click(function () {
            return false;
        });
    };

    // Initialize phone number select
    function phoneNoselect() {
        if ($('#msform').length) {
            $("#phone").intlTelInput();
            $("#phone").intlTelInput("setNumber", "+880");
        };
    };

    // Initialize nice select
    function nice_Select() {
        if ($('.product_select').length) {
            $('select').niceSelect();
        };
    };

    return (
        <section className="multi_step_form">
            <form id="msform">
                {/* Title */}
                <div className="tittle">
                    <h2>Verification Process</h2>
                    <p>In order to use this service, you have to complete this verification process</p>
                </div>
                {/* Progress bar */}
                <ul id="progressbar">
                    <li className="active">Verify Phone</li>
                    <li>Upload Documents</li>
                    <li>Security Questions</li>
                </ul>
                {/* Fieldsets */}
                <fieldset>
                    <h3>Setup your phone</h3>
                    <h6>We will send you a SMS. Input the code to verify.</h6>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <input type="tel" id="phone" className="form-control" placeholder="+880" />
                        </div>
                        <div className="form-group col-md-6">
                            <input type="text" className="form-control" placeholder="1123456789" />
                        </div>
                    </div>
                    <div className="done_text">
                        <a href="#" className="don_icon"><i className="ion-android-done"></i></a>
                        <h6>A secret code is sent to your phone. <br />Please enter it here.</h6>
                    </div>
                    <div className="code_group">
                        <input type="text" className="form-control" placeholder="0" />
                        <input type="text" className="form-control" placeholder="0" />
                        <input type="text" className="form-control" placeholder="0" />
                        <input type="text" className="form-control" placeholder="0" />
                    </div>
                    <button type="button" className="action-button previous_button">Back</button>
                    <button type="button" className="next action-button">Continue</button>
                </fieldset>
                <fieldset>
                    <h3>Verify Your Identity</h3>
                    <h6>Please upload any of these documents to verify your Identity.</h6>
                    <div className="passport">
                        <h4>Govt. ID card <br />PassPort <br />Driving License.</h4>
                        <a href="#" className="don_icon"><i className="ion-android-done"></i></a>
                    </div>
                    <div className="input-group">
                        <div className="custom-file">
                            <input type="file" className="custom-file-input" id="upload" />
                            <label className="custom-file-label" htmlFor="upload"><i className="ion-android-cloud-outline"></i>Choose file</label>
                        </div>
                    </div>
                    <ul className="file_added">
                        <li>File Added:</li>
                        <li><a href="#"><i className="ion-paperclip"></i>national_id_card.png</a></li>
                        <li><a href="#"><i className="ion-paperclip"></i>national_id_card_back.png</a></li>
                    </ul>
                    <button type="button" className="action-button previous previous_button">Back</button>
                    <button type="button" className="next action-button">Continue</button>
                </fieldset>
                <fieldset>
                    <h3>Create Security Questions</h3>
                    <h6>Please update your account with security questions</h6>
                    <div className="form-group">
                        <select className="product_select">
                            <option data-display="1. Choose A Question">1. Choose A Question</option>
                            <option>2. Choose A Question</option>
                            <option>3. Choose A Question</option>
                        </select>
                    </div>
                    <div className="form-group fg_2">
                        <input type="text" className="form-control" placeholder="Answer here:" />
                    </div>
                    <div className="form-group">
                        <select className="product_select">
                            <option data-display="1. Choose A Question">1. Choose A Question</option>
                            <option>2. Choose A Question</option>
                            <option>3. Choose A Question</option>
                        </select>
                    </div>
                    <div className="form-group fg_3">
                        <input type="text" className="form-control" placeholder="Answer here:" />
                    </div>
                    <button type="button" className="action-button previous previous_button">Back</button>
                    <a href="#" className="action-button">Finish</a>
                </fieldset>
            </form>
        </section>
    );
};

export default MultiStepForm;
