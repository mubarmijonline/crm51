Modal dialog with scrim, header, body and right-aligned footer actions.

```jsx
<Dialog title="Delete workspace?" description="This cannot be undone."
  footer={<><Button onClick={close}>Cancel</Button><Button variant="danger">Delete</Button></>} onClose={close} />
```
