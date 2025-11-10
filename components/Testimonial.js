export default function Testimonial({ testimonial }) {
  return (
    <div className="bg-white p-8 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mr-4">
          <span className="text-2xl font-bold text-primary-600">
            {testimonial.name.charAt(0)}
          </span>
        </div>
        <div>
          <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
          <p className="text-sm text-gray-600">{testimonial.role}</p>
        </div>
      </div>
      <p className="text-gray-700 italic">&quot;{testimonial.quote}&quot;</p>
    </div>
  );
}
