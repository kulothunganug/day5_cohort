async function initiatePayment(course) {
  try {
    const order = await apiRequest("/payments/create-order", "POST", {
      course_id: course.id,
    });

    const options = {
      key: "rzp_test_SQZDv0qJhZKof9", // Should ideally come from backend or env
      amount: order.amount,
      currency: "INR",
      name: "LearnHub",
      description: `Purchase ${course.title}`,
      order_id: order.id,
      handler: async function (response) {
        const verifyPayload = {
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature,
          course_id: course.id,
        };

        try {
          await apiRequest("/payments/verify-payment", "POST", verifyPayload);
          showToast("Payment successful! Course unlocked.");
          loadCourseDetails(course.id);
        } catch (error) {
          showToast("Payment verification failed", "error");
        }
      },
      prefill: {
        name: "", // Will be filled from current user if available
        email: "",
      },
      theme: {
        color: "#4f46e5",
      },
    };

    const rzp = new Razorpay(options);
    rzp.open();
  } catch (error) {
    showToast("Could not initiate payment", "error");
  }
}
