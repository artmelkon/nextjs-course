import classes from './comment-list.module.css';

interface CommentProps {
  items: {
    id: string
    name: string
    text: string
  }[]
}

function CommentList({items}: CommentProps) {
  return (
    <ul className={classes.comments}>
      {/* Render list of comments - fetched from API */}
      {
        items.map(item => <li key={item.id}>
          <p>{item.text}</p>
          <div>
            By <address>{item.name}</address>
          </div>
        </li>)
      }
    </ul>
  );
}

export default CommentList;
