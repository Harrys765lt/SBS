import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Progress } from "../ui/progress";
import { Star, StarHalf, MessageSquare, ThumbsUp, Reply as ReplyIcon, Calendar, Scissors, Palette, Sparkles, TrendingUp, Search } from "lucide-react";

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 }
};

const ReviewsPage = () => {
    const [selectedRating, setSelectedRating] = useState("all");
    const [selectedService, setSelectedService] = useState("all");
    const [selectedDateRange, setSelectedDateRange] = useState("30days");
    const [searchQuery, setSearchQuery] = useState("");

    // Sample review data
    const reviews = [
        {
            id: 1,
            name: "Sarah Johnson",
            rating: 5.0,
            date: "November 14, 2025",
            service: "Haircut & Style",
            comment: "Absolutely amazing experience! Emma did an incredible job with my haircut. She listened to exactly what I wanted and delivered beyond my expectations. The salon is clean, modern, and has a great atmosphere. Will definitely be back!",
            verified: true,
            replied: false
        },
        {
            id: 2,
            name: "Michael Brown",
            rating: 4.0,
            date: "November 13, 2025",
            service: "Men's Cut",
            comment: "Great haircut by James. Quick, professional, and exactly what I asked for. Only reason for 4 stars instead of 5 is the wait time was a bit longer than expected. Otherwise, highly recommend!",
            verified: true,
            replied: true,
            response: "Thank you for your feedback, Michael! We apologize for the wait time and are working to improve our scheduling. We're glad James took great care of you!"
        },
        {
            id: 3,
            name: "Emily Davis",
            rating: 5.0,
            date: "November 12, 2025",
            service: "Hair Coloring",
            comment: "Emma is a color genius! She transformed my hair with beautiful highlights. The color is exactly what I envisioned. The whole team is friendly and professional. Best salon in town!",
            verified: true,
            replied: false
        },
        {
            id: 4,
            name: "Jessica Martinez",
            rating: 4.5,
            date: "November 11, 2025",
            service: "Hair Treatment",
            comment: "Olivia gave me an amazing hair treatment that left my hair feeling incredibly soft and healthy. The products they use are top quality. Highly recommend their treatments!",
            verified: true,
            replied: false
        },
        {
            id: 5,
            name: "David Wilson",
            rating: 3.0,
            date: "November 10, 2025",
            service: "Men's Cut",
            comment: "The haircut was okay, but not exactly what I asked for. Service was friendly but I expected more attention to detail for the price.",
            verified: true,
            replied: false
        }
    ];

    const ratingDistribution = [
        { stars: 5, percentage: 65, count: 161 },
        { stars: 4, percentage: 25, count: 62 },
        { stars: 3, percentage: 6, count: 15 },
        { stars: 2, percentage: 3, count: 7 },
        { stars: 1, percentage: 1, count: 3 }
    ];

    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
<div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
  {/* Full Stars - Colored based on rating */}
  {[...Array(fullStars)].map((_, i) => (
    <span
      key={`full-${i}`}
      style={{
        fontSize: '18px',
        color: 
          rating >= 4.5 ? '#facc15' :   // Gold for 4.5+
          rating >= 4.0 ? '#fbbf24' :   // Bright yellow for 4.0–4.4
          rating >= 3.5 ? '#f97316' :   // Orange for 3.5–3.9
          '#ef4444',                    // Red for below 3.5
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
        lineHeight: '1'
      }}
    >
      ★
    </span>
  ))}

  {/* Half Star */}
  {hasHalfStar && (
    <span
      style={{
        fontSize: '18px',
        background: `linear-gradient(90deg, ${
          rating >= 4.5 ? '#facc15' :
          rating >= 4.0 ? '#fbbf24' :
          rating >= 3.5 ? '#f97316' : '#ef4444'
        } 50%, #e5e7eb 50%)`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))',
        lineHeight: '1'
      }}
    >
      ★
    </span>
  )}

  {/* Empty Stars */}
  {[...Array(emptyStars)].map((_, i) => (
    <span
      key={`empty-${i}`}
      style={{
        fontSize: '18px',
        color: '#d1d5db',
        lineHeight: '1'
      }}
    >
      ★
    </span>
  ))}
</div>
        );
    };

    return (
        <div className="min-h-screen p-4 md:p-8 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
            {/* Header */}
            <motion.div
                className="mb-8"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                viewport={{ once: true }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3 text-gray-900">
                    <Star className="w-8 h-8 md:w-10 md:h-10 text-yellow-500 fill-yellow-500" />
                    Customer Reviews & Feedback
                </h1>
                <p className="text-gray-600 text-base md:text-lg">
                    Monitor customer satisfaction and respond to feedback
                </p>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
                initial="initial"
                animate="animate"
                variants={staggerContainer}
                viewport={{ once: true }}
            >
                {/* Average Rating Card */}
                <motion.div variants={scaleIn} viewport={{ once: true }}>
                    <Card className="text-center" style={{ backgroundColor: '#ffffff', border: '2px solid #fbbf24', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <CardContent className="pt-6 pb-6">
                            <div className="text-5xl md:text-6xl font-bold text-yellow-500 mb-3">4.6</div>
                            <div className="flex justify-center mb-2">
                                {renderStars(4.6)}
                            </div>
                            <p className="text-gray-700 font-medium">Average Rating</p>
                            <p className="text-sm text-gray-500">Based on 248 reviews</p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Total Reviews Card */}
                <motion.div variants={scaleIn} viewport={{ once: true }}>
                    <Card style={{ background: 'linear-gradient(to bottom right, #10b981, #059669)', color: '#ffffff', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <CardContent className="pt-6 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-green-100 text-sm mb-1 font-medium">Total Reviews</p>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">248</h2>
                                    <p className="text-sm text-green-100">
                                        <TrendingUp className="w-4 h-4 inline mr-1" />
                                        32 this week
                                    </p>
                                </div>
                                <MessageSquare className="w-10 h-10 md:w-12 md:h-12 opacity-30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Positive Reviews Card */}
                <motion.div variants={scaleIn} viewport={{ once: true }}>
                    <Card style={{ background: 'linear-gradient(to bottom right, #3b82f6, #2563eb)', color: '#ffffff', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <CardContent className="pt-6 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-blue-100 text-sm mb-1 font-medium">Positive Reviews</p>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">92%</h2>
                                    <p className="text-sm text-blue-100">
                                        <ThumbsUp className="w-4 h-4 inline mr-1" />
                                        228 reviews
                                    </p>
                                </div>
                                <ThumbsUp className="w-10 h-10 md:w-12 md:h-12 opacity-30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Response Rate Card */}
                <motion.div variants={scaleIn} viewport={{ once: true }}>
                    <Card style={{ background: 'linear-gradient(to bottom right, #fbbf24, #f59e0b)', color: '#111827', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                        <CardContent className="pt-6 pb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-gray-800 text-sm mb-1 font-medium">Response Rate</p>
                                    <h2 className="text-3xl md:text-4xl font-bold mb-2">87%</h2>
                                    <p className="text-sm text-gray-800">
                                        <ReplyIcon className="w-4 h-4 inline mr-1" />
                                        Reply within 24h
                                    </p>
                                </div>
                                <ReplyIcon className="w-10 h-10 md:w-12 md:h-12 opacity-30" />
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            {/* Rating Distribution */}
            <motion.div
                className="mb-8"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                viewport={{ once: true }}
            >
                <Card className="bg-white shadow-2xl border-2 border-gray-300 mt-4">
                    <CardHeader className="border-b border-gray-200">
                        <CardTitle className="flex items-center gap-2 text-gray-900">
                            <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                            Rating Distribution
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {ratingDistribution.map((item) => (
                                <div key={item.stars} className="flex items-center gap-3 md:gap-4">
                                    <div className="w-14 md:w-16 text-right font-semibold flex items-center justify-end gap-1 text-gray-900">
                                        {item.stars} <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    </div>
                                    <div className="flex-1">
                                        <Progress value={item.percentage} className="h-4 md:h-5 bg-gray-200" />
                                    </div>
                                    <div className="w-20 md:w-24 text-xs md:text-sm text-gray-600 font-medium">
                                        {item.percentage}% ({item.count})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="mb-8"
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                viewport={{ once: true }}
            >
                <Card className="mt-4" style={{ backgroundColor: '#ffffff', border: '2px solid #d1d5db', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                    <CardContent className="pt-6 pb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <Label htmlFor="rating-filter" className="mb-2 block font-semibold text-gray-700">
                                    Rating Filter
                                </Label>
                                <Select value={selectedRating} onValueChange={setSelectedRating}>
                                    <SelectTrigger id="rating-filter" className="bg-white border-gray-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Ratings</SelectItem>
                                        <SelectItem value="5">5 Stars</SelectItem>
                                        <SelectItem value="4">4 Stars</SelectItem>
                                        <SelectItem value="3">3 Stars</SelectItem>
                                        <SelectItem value="2">2 Stars</SelectItem>
                                        <SelectItem value="1">1 Star</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="service-filter" className="mb-2 block font-semibold text-gray-700">
                                    Service Type
                                </Label>
                                <Select value={selectedService} onValueChange={setSelectedService}>
                                    <SelectTrigger id="service-filter" className="bg-white border-gray-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Services</SelectItem>
                                        <SelectItem value="haircut">Haircut</SelectItem>
                                        <SelectItem value="coloring">Hair Coloring</SelectItem>
                                        <SelectItem value="treatment">Hair Treatment</SelectItem>
                                        <SelectItem value="styling">Styling</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="date-filter" className="mb-2 block font-semibold text-gray-700">
                                    Date Range
                                </Label>
                                <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
                                    <SelectTrigger id="date-filter" className="bg-white border-gray-300">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7days">Last 7 days</SelectItem>
                                        <SelectItem value="30days">Last 30 days</SelectItem>
                                        <SelectItem value="3months">Last 3 months</SelectItem>
                                        <SelectItem value="all">All time</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div>
                                <Label htmlFor="search-reviews" className="mb-2 block font-semibold text-gray-700">
                                    Search
                                </Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="search-reviews"
                                        placeholder="Search reviews..."
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-white border-gray-300"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Recent Reviews */}
            <motion.div
                initial="initial"
                animate="animate"
                variants={fadeInUp}
                viewport={{ once: true }}
            >
                <Card style={{
                    marginTop: '1rem',
                    backgroundColor: '#ffffff',
                    border: '2px solid #d1d5db',
                    borderRadius: '12px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    overflow: 'hidden'
                }}>
                    <CardHeader style={{
                        padding: '1.5rem 1.5rem 1rem',
                        borderBottom: '1px solid #e5e7eb'
                    }}>
                        <CardTitle style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1.25rem',
                            fontWeight: 'bold',
                            color: '#111827'
                        }}>
                            <MessageSquare style={{ width: '20px', height: '20px', color: '#2563eb' }} />
                            Recent Reviews
                        </CardTitle>
                    </CardHeader>

                    <CardContent style={{ padding: '1.5rem' }}>
                        <motion.div
                            style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
                            variants={staggerContainer}
                            initial="initial"
                            animate="animate"
                            viewport={{ once: true }}
                        >
                            {reviews.map((review, index) => (
                                <motion.div
                                    key={review.id}
                                    variants={scaleIn}
                                    viewport={{ once: true }}
                                    style={{
                                        paddingBottom: index !== reviews.length - 1 ? '1.5rem' : '0',
                                        borderBottom: index !== reviews.length - 1 ? '2px solid #e5e7eb' : 'none'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '0.75rem'
                                    }}>
                                        <div>
                                            <h6 style={{
                                                fontWeight: 'bold',
                                                fontSize: '1.125rem',
                                                marginBottom: '0.25rem',
                                                color: '#1f2937'
                                            }}>
                                                {review.name}
                                            </h6>

                                            {/* Star Rating with Color */}
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                marginBottom: '0.25rem'
                                            }}>
                                                <div style={{ display: 'flex', gap: '2px' }}>
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <span
                                                            key={star}
                                                            style={{
                                                                fontSize: '1.1rem',
                                                                color:
                                                                    star <= review.rating
                                                                        ? review.rating >= 4.5
                                                                            ? '#facc15'  // Gold for 4.5+
                                                                            : review.rating >= 3.5
                                                                                ? '#f97316'  // Orange for 3.5–4.4
                                                                                : '#ef4444'  // Red for below 3.5
                                                                        : '#d1d5db', // Gray for empty
                                                                filter: star <= review.rating ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' : 'none'
                                                            }}
                                                        >
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                                <span style={{
                                                    fontWeight: '600',
                                                    color: '#1f2937',
                                                    fontSize: '0.95rem'
                                                }}>
                                                    {review.rating.toFixed(1)}
                                                </span>
                                            </div>

                                            <p style={{
                                                fontSize: '0.875rem',
                                                color: '#6b7280',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                flexWrap: 'wrap'
                                            }}>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    <Calendar style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                                                    {review.date}
                                                </span>
                                                <span style={{ color: '#9ca3af' }}>•</span>
                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                    {review.service.includes("Color") ? (
                                                        <Palette style={{ width: '12px', height: '12px', color: '#a855f7' }} />
                                                    ) : review.service.includes("Treatment") ? (
                                                        <Sparkles style={{ width: '12px', height: '12px', color: '#ec4899' }} />
                                                    ) : (
                                                        <Scissors style={{ width: '12px', height: '12px', color: '#3b82f6' }} />
                                                    )}
                                                    {review.service}
                                                </span>
                                            </p>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            {review.verified && (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: '#10b981',
                                                    color: '#ffffff',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    borderRadius: '9999px',
                                                    display: 'inline-block'
                                                }}>
                                                    Verified
                                                </span>
                                            )}
                                            {!review.replied && review.rating < 4 && (
                                                <span style={{
                                                    padding: '0.25rem 0.75rem',
                                                    backgroundColor: '#fef9c3',
                                                    color: '#ca8a04',
                                                    border: '1px solid #fde047',
                                                    fontSize: '0.75rem',
                                                    fontWeight: '600',
                                                    borderRadius: '9999px',
                                                    display: 'inline-block'
                                                }}>
                                                    Pending Response
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <p style={{
                                        fontSize: '0.875rem',
                                        lineHeight: '1.6',
                                        color: '#374151',
                                        marginBottom: '0.75rem'
                                    }}>
                                        {review.comment}
                                    </p>

                                    {review.replied && review.response && (
                                        <div style={{
                                            padding: '0.75rem',
                                            backgroundColor: '#eff6ff',
                                            border: '1px solid #bfdbfe',
                                            borderRadius: '0.5rem',
                                            marginBottom: '0.75rem'
                                        }}>
                                            <p style={{
                                                fontSize: '0.75rem',
                                                fontWeight: '700',
                                                color: '#1d4ed8',
                                                marginBottom: '0.25rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.25rem'
                                            }}>
                                                <ReplyIcon style={{ width: '12px', height: '12px' }} />
                                                Salon Response:
                                            </p>
                                            <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                                                {review.response}
                                            </p>
                                        </div>
                                    )}

                                    {!review.replied && (
                                        <Button
                                            size="sm"
                                            style={{
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                borderRadius: '0.375rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.375rem',
                                                cursor: 'pointer',
                                                border: 'none',
                                                fontWeight: '500',
                                                ...(review.rating < 4
                                                    ? { backgroundColor: '#dc2626', color: '#ffffff' }
                                                    : { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }
                                                )
                                            }}
                                        >
                                            <ReplyIcon style={{ width: '16px', height: '16px' }} />
                                            {review.rating < 4 ? "Reply Now (Urgent)" : "Reply"}
                                        </Button>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </CardContent>

                    <CardFooter style={{
                        padding: '1rem 1.5rem',
                        borderTop: '1px solid #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        alignItems: 'center'
                    }}>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                            Showing 5 of 248 reviews
                        </p>
                        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                            <button disabled style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#f9fafb',
                                color: '#9ca3af',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem',
                                fontSize: '0.875rem'
                            }}>
                                Previous
                            </button>
                            <button style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#2563eb',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '0.375rem',
                                fontWeight: '600'
                            }}>
                                1
                            </button>
                            {[2, 3].map(num => (
                                <button key={num} style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#ffffff',
                                    color: '#374151',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.375rem'
                                }}>
                                    {num}
                                </button>
                            ))}
                            <button style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: '#ffffff',
                                color: '#374151',
                                border: '1px solid #d1d5db',
                                borderRadius: '0.375rem'
                            }}>
                                Next
                            </button>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default ReviewsPage;
