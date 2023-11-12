import { useState, useEffect, useContext } from "react";

import CommentList from "./comment-list";
import NewComment from "./new-comment";
import classes from "./comments.module.css";
import NotificationContext from "@/store/notification-context";

interface CommentIdProps {
  eventId: string;
}

function Comments(props: CommentIdProps) {
  const { eventId } = props;

  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [isFetching, setIsFetching] = useState(false)
  const notificationCts = useContext(NotificationContext);

  useEffect(() => {
    if (showComments) {
      setIsFetching(true)
      const fetchedData = async () => {
        const response = await fetch(`/api/comments/${eventId}`);
        const data = await response.json();
        setComments(data.comments);
        setIsFetching(false)
      };
      fetchedData();
    }
  }, [showComments]);



  function toggleCommentsHandler() {
    setShowComments((prevStatus) => !prevStatus);
  }

  async function addCommentHandler<T>(commentData: T) {
    notificationCts.showNotification({
      title: "Loading...",
      message: "Please wait!",
      status: "pending",
    });
    // send data to API
    const response = await fetch(`/api/comments/${eventId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(commentData),
    });

    try {
      if(!response.ok) throw Error(response.statusText || 'Something went wrong!');
      const data = await response.json();
      console.log(data);
      return notificationCts.showNotification({
        title: "Success",
        message: "Comment saved successfully!",
        status: "success",
      });
    } catch (err: any) {
      notificationCts.showNotification({
        title: "Error",
        message: err.message || "Unable to load messages!",
        status: "error"
      })
    }

  }

  return (
    <section className={classes.comments}>
      <button onClick={toggleCommentsHandler}>
        {showComments ? "Hide" : "Show"} Comments
      </button>
      {showComments && <NewComment onAddComment={addCommentHandler} />}
      {showComments && !isFetching && <CommentList items={comments} />}
      {showComments && isFetching && <p>Loading...!</p>}
    </section>
  );
}

export default Comments;
