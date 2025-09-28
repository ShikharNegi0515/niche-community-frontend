# Niche Community Frontend

This is a React + Vite frontend for **Niche Community**, a social platform where users can join communities, create posts, comment, and interact with others.

The project uses Vite for fast development and HMR, and React with Context API for state management.

---

## Features

- User signup, login, and profile management
- Join, leave, and create communities
- Create, view, and delete posts
- Comment on posts
- Search posts by title or author
- Responsive and interactive UI

---

## React Compiler

This project uses the default React setup with Vite. If you want to enable the **React Compiler** for experimental features, see [React Compiler installation](https://react.dev/learn/react-compiler/installation).

---

## Expanding the ESLint configuration

For production development, it is recommended to integrate TypeScript and type-aware lint rules. See the [Vite React + TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) and [`typescript-eslint`](https://typescript-eslint.io) documentation for more information.

---

## Tech Stack

- **Frontend:** React, React Router, Context API
- **HTTP Requests:** Fetch API / Axios
- **Styling:** CSS
- **Deployment:** Vercel (frontend), Render (backend)

---

## Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/niche-community-frontend.git
cd niche-community-frontend
```

2. Install dependencies:
   
```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open http://localhost:5173 in your browser.

## Environment Variables

Create a `.env` file in the root:

```env
VITE_BASE_URL=https://niche-community-backend.onrender.com
```
Replace the URL with your backend deployment if different.

## Contributing

1. Fork the repository
2. Create a new branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

## License

MIT License

