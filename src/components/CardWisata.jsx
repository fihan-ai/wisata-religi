import { motion } from "framer-motion";

export default function CardWisata({ image, name, description, onClick }) {
  return (
    <motion.div
      className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
      whileHover={{ scale: 1.05 }}
      whileInView={{ opacity: 1, y: 0 }}
      initial={{ opacity: 0, y: 30 }}
      transition={{ duration: 0.5 }}
    >
      <div className="overflow-hidden">
        <motion.img
          src={image}
          alt={name}
          className="h-48 w-full object-cover rounded-t-xl"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.4 }}
        />
      </div>

      <div className="p-5 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-semibold text-blue-700 mb-2">{name}</h3>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            {description}
          </p>
        </div>

        {/* Tombol Selengkapnya */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClick}
          className="mt-auto bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-300"
        >
          Selengkapnya →
        </motion.button>
      </div>
    </motion.div>
  );
}
