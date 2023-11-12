import React, { useRef, useContext } from "react";
import classes from "./newsletter-registration.module.css";
import NotificationContext from "@/store/notification-context";

const NewsletterRegistration = () => {
  const emailRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const notificationCtx = useContext(NotificationContext);

  async function registrationHandler(event: any) {
    event.preventDefault();

    // fetch user input (state or refs)
    // optional: validate input
    // send valid data to API

    const emailInput = emailRef.current?.value;
    notificationCtx.showNotification({
      title: "Signing up...",
      message: "Registering for newsletter",
      status: "pending",
    });
    const reqBody = { email: emailInput };
    const response = await fetch("/api/newsletter", {
      method: "POST",
      body: JSON.stringify(reqBody),
      headers: {
        "Content-Type": "application/json",
      },
    });

    try {
      if (!response.ok)
        throw Error(response.statusText || "Something went wrong");
      const data = await response.json();
      console.log(data);
      return notificationCtx.showNotification({
        title: "Success",
        message: "Successfully registered for newsletter",
        status: "success",
      });
    } catch (err: any) {
      return notificationCtx.showNotification({
        title: "Error",
        message: err.message || "Something went wrong!",
        status: "error",
      });
    }
  }

  return (
    <section className={classes.newsletter}>
      <h2>Sign up to stay updated!</h2>
      <form onSubmit={registrationHandler}>
        <div className={classes.control}>
          <input
            type="email"
            id="email"
            placeholder="Your email"
            aria-label="Your email"
            ref={emailRef}
          />
          <button>Register</button>
        </div>
      </form>
    </section>
  );
};

export default NewsletterRegistration;
