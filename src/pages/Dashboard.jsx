import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import Navbar from "../components/Navbar.jsx";
import { BASE_URL } from "../components/utils.js";

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
            const res = await fetch(`${BASE_URL}/api/communities`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setCommunities(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Fetch posts (feed or specific community)
    const fetchPosts = async () => {
        try {
            let url = "";
            if (selectedCommunity === "home") {
                url = `${BASE_URL}/api/posts/feed`;
            } else {
                url = `${BASE_URL}/api/posts?communityId=${selectedCommunity}`;
            }

            const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
            const data = await res.json();
            if (res.ok) {
                setPosts(data);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (user && token) {
            fetchCommunities();
        }
    }, [user, token]);

    useEffect(() => {
        if (token) {
            fetchPosts();
        }
    }, [selectedCommunity, token]);

    // Create post
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!title || !content || selectedCommunity === "home") {
            alert("Please fill all fields and select a community");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/api/posts`, {
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
                // Prepend user username for immediate UI updates
                data.user = { _id: user.id, username: user.username };
                const currentComm = communities.find((c) => c._id === selectedCommunity);
                data.community = { _id: selectedCommunity, name: currentComm ? currentComm.name : "Community" };
                
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
            const res = await fetch(`${BASE_URL}/api/communities/${id}/join`, {
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
            const res = await fetch(`${BASE_URL}/api/communities/${id}/leave`, {
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
                fetchPosts(); 
            } else {
                const data = await res.json();
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete community (Fixing missing function)
    const deleteCommunity = async (id) => {
        if (!window.confirm("Are you sure you want to delete this community? This will delete all its posts!")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/communities/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setCommunities(communities.filter((c) => c._id !== id));
                if (selectedCommunity === id) {
                    setSelectedCommunity("home");
                }
            } else {
                alert(data.message || "Failed to delete community");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Delete post
    const deletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetch(`${BASE_URL}/api/posts/${id}`, {
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

    // Filter posts by search query safely
    const filteredPosts = posts.filter((post) => {
        const titleMatch = post.title?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const userMatch = post.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        const contentMatch = post.content?.toLowerCase().includes(searchQuery.toLowerCase()) || false;
        return titleMatch || userMatch || contentMatch;
    });

    const activeCommunityData = communities.find((c) => c._id === selectedCommunity);
    const joinedCommunities = communities.filter((c) => c.members.some((m) => m.toString() === user?.id));

    return (
        <div className="dashboard-page">
            <Navbar refreshCommunities={fetchCommunities} />
            <div className="dashboard-container">
                
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <h3>Feeds</h3>
                        <ul>
                            <li 
                                className={selectedCommunity === "home" ? "active" : ""}
                                onClick={() => setSelectedCommunity("home")}
                                style={{ cursor: "pointer" }}
                            >
                                <span className="sidebar-name">🏠 Personal Feed</span>
                            </li>
                        </ul>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1, overflowY: "auto" }}>
                        <h3>Communities ({communities.length})</h3>
                        <ul>
                            {communities.map((c) => {
                                const isMember = c.members.some((m) => m.toString() === user?.id);
                                const isCreator = c.creator === user?.id;
                                const isActive = selectedCommunity === c._id;
                                
                                return (
                                    <li 
                                        key={c._id} 
                                        className={isActive ? "active" : ""}
                                    >
                                        <span
                                            className="sidebar-name"
                                            onClick={() => setSelectedCommunity(c._id)}
                                        >
                                            🪐 {c.name}
                                        </span>
                                        <div className="sidebar-actions">
                                            {isMember ? (
                                                <button
                                                    className="sidebar-btn leave"
                                                    onClick={() => leaveCommunity(c._id)}
                                                >
                                                    Leave
                                                </button>
                                            ) : (
                                                <button
                                                    className="sidebar-btn join"
                                                    onClick={() => joinCommunity(c._id)}
                                                >
                                                    Join
                                                </button>
                                            )}
                                            {isCreator && (
                                                <button
                                                    className="sidebar-btn delete"
                                                    onClick={() => deleteCommunity(c._id)}
                                                    title="Delete Community"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </aside>

                {/* Main feed content */}
                <main className="dashboard-main">
                    <div className="feed-header-section">
                        <div>
                            <h2>
                                {selectedCommunity === "home" 
                                    ? "Your Personal Feed" 
                                    : `🪐 ${activeCommunityData?.name || "Community"}`}
                            </h2>
                            {selectedCommunity !== "home" && activeCommunityData?.description && (
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                                    {activeCommunityData.description}
                                </p>
                            )}
                        </div>

                        {/* Search Input */}
                        <div className="post-search" style={{ maxWidth: "320px" }}>
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Create post form (Only when in a joined community) */}
                    {selectedCommunity !== "home" && activeCommunityData?.members.some((m) => m.toString() === user?.id) && (
                        <div className="post-form-panel">
                            <h3>✨ Share something with {activeCommunityData.name}</h3>
                            <form className="post-form-grid" onSubmit={handlePostSubmit}>
                                <input
                                    type="text"
                                    placeholder="Catchy title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                                <textarea
                                    placeholder="What's on your mind? Supports text content..."
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    style={{ minHeight: "100px", resize: "vertical" }}
                                    required
                                />
                                <button type="submit" className="primary-btn">Post</button>
                            </form>
                        </div>
                    )}

                    {selectedCommunity !== "home" && !activeCommunityData?.members.some((m) => m.toString() === user?.id) && (
                        <div className="glass-panel" style={{ textAlign: "center", padding: "2.5rem 1.5rem", marginBottom: "2rem" }}>
                            <p style={{ color: "var(--text-secondary)", marginBottom: "1rem" }}>
                                You are not a member of this community yet. Join now to view all posts and create your own!
                            </p>
                            <button className="primary-btn" onClick={() => joinCommunity(activeCommunityData._id)}>
                                Join Community
                            </button>
                        </div>
                    )}

                    {/* Posts feed */}
                    <div className="posts-container">
                        {filteredPosts.length > 0 ? (
                            filteredPosts.map((post) => (
                                <div
                                    className="post-card"
                                    key={post._id}
                                    onClick={() => goToPost(post._id)}
                                >
                                    <h3>{post.title}</h3>
                                    <p>{post.content}</p>
                                    <div className="post-meta">
                                        <div className="post-author">
                                            <span>👤 By <strong>{post.user?.username || "Anonymous"}</strong></span>
                                            <span>•</span>
                                            <span>📅 {new Date(post.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                                            <span className="post-tag">
                                                🪐 {post.community?.name || activeCommunityData?.name || "Feed"}
                                            </span>
                                            {post.user?._id === user?.id && (
                                                <button
                                                    className="post-delete-btn"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deletePost(post._id);
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="glass-panel" style={{ textAlign: "center", padding: "3rem 1.5rem", color: "var(--text-secondary)" }}>
                                <p style={{ fontSize: "1.1rem" }}>No posts found in this feed.</p>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                    {selectedCommunity === "home" 
                                        ? "Join some communities and start reading!" 
                                        : "Be the first one to share a post here!"}
                                </p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
