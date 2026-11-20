export const imagePaths = {
  heroPoster: '/images/hero-holo-poster.jpg',
  injurySample: '/images/injury-sample.jpg',
  doctors: ['/images/doctor-1.jpg', '/images/doctor-2.jpg'],
};

export const getDoctorImage = (index = 0) => imagePaths.doctors[index % imagePaths.doctors.length];
