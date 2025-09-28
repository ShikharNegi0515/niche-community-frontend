import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const token = localStorage.getItem("token");
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [selectedCommunity, setSelectedCommunity] = useState("home"); // "home" by default

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all communities
    const fetchCommunities = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/communities", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setCommunities(data);
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch posts (feed or specific community)
    const fetchPosts = async () => {
        try {
            let url = "";
            if (selectedCommunity === "home") {
                url = "http://localhost:5000/api/posts/feed";
            } else {
                url = `http://localhost:5000/api/posts?communityId=${selectedCommunity}`;
            }

            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            setPosts(data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchCommunities();
    }, [user, token]);

    useEffect(() => {
        fetchPosts();
    }, [selectedCommunity, token]);

    // Create post
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || selectedCommunity === "home") {
            alert("Please fill all fields and select a community");
            return;
        }

        try {
            const res = await fetch("http://localhost:5000/api/posts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    communityId: selectedCommunity,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                setPosts([data, ...posts]);
                setTitle("");
                setContent("");
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Join community
    const joinCommunity = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/communities/${id}/join`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const updated = communities.map((c) =>
                    c._id === id ? { ...c, members: [...c.members, user.id] } : c
                );
                setCommunities(updated);
                fetchPosts(); // refresh posts after joining
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Leave community
    const leaveCommunity = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/api/communities/${id}/leave`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const updated = communities.map((c) =>
                    c._id === id
                        ? { ...c, members: c.members.filter((m) => m.toString() !== user.id) }
                        : c
                );
                setCommunities(updated);
                fetchPosts(); // refresh posts after leaving
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete post
    const deletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`http://localhost:5000/api/posts/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setPosts(posts.filter((p) => p._id !== id));
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Navigate to post page
    const goToPost = (postId) => {
        navigate(`/posts/${postId}`);
    };

    // Filter posts by search query
    const filteredPosts = posts.filter((post) => {
        const titleMatch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
        const userMatch = post.user.username.toLowerCase().includes(searchQuery.toLowerCase());
        return titleMatch || userMatch;
    });

    return (
        <div className="dashboard-page">
            <Navbar refreshCommunities={fetchCommunities} />
            <div className="dashboard-container">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <h3>Communities</h3>
                    <ul>
                        <li>
                            <span
                                style={{ cursor: "pointer", fontWeight: selectedCommunity === "home" ? "bold" : "normal" }}
                                onClick={() => setSelectedCommunity("home")}
                            >
                                Home
                            </span>
                        </li>
                        {communities.map((c) => {
                            const isMember = c.members.some((m) => m.toString() === user.id);
                            const isCreator = c.creator === user.id;
                            return (
                                <li key={c._id} style={{ marginBottom: "0.8rem" }}>
                                    <span
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: selectedCommunity === c._id ? "bold" : "normal",
                                        }}
                                        onClick={() => setSelectedCommunity(c._id)}
                                    >
                                        {c.name}
                                    </span>
                                    {isMember ? (
                                        <button style={{ marginLeft: "0.5rem" }} onClick={() => leaveCommunity(c._id)}>
                                            Leave
                                        </button>
                                    ) : (
                                        <button style={{ marginLeft: "0.5rem" }} onClick={() => joinCommunity(c._id)}>
                                            Join
                                        </button>
                                    )}
                                    {isCreator && (
                                        <button
                                            style={{ marginLeft: "0.5rem", color: "red" }}
                                            onClick={() => deleteCommunity(c._id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </aside>

                {/* Main feed content */}
                <main className="dashboard-main">
                    <h2>Welcome, {user?.username || "User"}!</h2>

                    {/* Search */}
                    <div className="post-search">
                        <input
                            type="text"
                            placeholder="Search posts by title or author..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Create post form */}
                    {selectedCommunity !== "home" && (
                        <div className="post-form">
                            <select
                                value={selectedCommunity}
                                onChange={(e) => setSelectedCommunity(e.target.value)}
                            >
                                <option value="" disabled>
                                    Select Community
                                </option>
                                {communities
                                    .filter((c) => c.members.some((m) => m.toString() === user.id))
                                    .map((c) => (
                                        <option key={c._id} value={c._id}>
                                            {c.name}
                                        </option>
                                    ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Post title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <textarea
                                placeholder="Write your post..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <button onClick={handlePostSubmit}>Post</button>
                        </div>
                    )}

                    {/* Posts feed */}
                    <div className="posts-container">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <div
                                    className="post-card"
                                    key={post._id}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => goToPost(post._id)}
                                >
                                    <h3>{post.title}</h3>
                                    <p>{post.content}</p>
                                    <small>
                                        By {post.user.username} in {post.community.name}
                                    </small>
                                    {post.user._id === user.id && (
                                        <button
                                            style={{ marginLeft: "0.5rem", color: "red" }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deletePost(post._id);
                                            }}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No posts found.</p>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
