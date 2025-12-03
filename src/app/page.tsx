'use client';

import { useState } from 'react';
import { Construction, Code, Zap, Rocket } from "lucide-react";
import { useRouter } from 'next/navigation';
import VisitorStats from '@/components/VisitorStats';
import VisitorDetailsModal from '@/components/VisitorDetailsModal';

export default function Home() {
	const router = useRouter();
	const [isModalOpen, setIsModalOpen] = useState(false);
	
	const handleDemoClick = () => {
		router.push('/demo');
	};
	
	const handleViewDetails = () => {
		setIsModalOpen(true);
	};
	
	return (
		<div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 overflow-hidden relative">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
				<div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
			</div>

			{/* Main content */}
			<div className="relative z-10 text-center max-w-4xl mx-auto">
				{/* Icon with animation */}
				<div className="mb-8 flex justify-center">
					<div className="relative">
						<div className="absolute inset-0 bg-orange-400 rounded-full animate-ping opacity-75"></div>
						<div className="relative bg-orange-500 rounded-full p-6 animate-bounce">
							<Construction className="w-16 h-16 text-white" />
						</div>
					</div>
				</div>

				{/* Main title */}
				<h1 className="text-6xl md:text-8xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-pink-400 animate-pulse">
					正在开发
				</h1>

				{/* Subtitle */}
				<h2 className="text-2xl md:text-4xl font-semibold text-gray-200 mb-8">
					Something Amazing is Coming Soon
				</h2>

				{/* Description */}
				<p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
					我们正在努力开发这个全栈项目，敬请期待！
					<br />
					We are working hard to build something incredible. Stay tuned!
				</p>

				{/* Feature cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
						<div className="flex justify-center mb-4">
							<Code className="w-8 h-8 text-blue-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">全栈开发</h3>
						<p className="text-gray-300 text-sm">Full Stack Development</p>
					</div>

					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
						<div className="flex justify-center mb-4">
							<Zap className="w-8 h-8 text-yellow-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">高性能</h3>
						<p className="text-gray-300 text-sm">High Performance</p>
					</div>

					<div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
						<div className="flex justify-center mb-4">
							<Rocket className="w-8 h-8 text-green-400" />
						</div>
						<h3 className="text-lg font-semibold text-white mb-2">即将上线</h3>
						<p className="text-gray-300 text-sm">Coming Soon</p>
					</div>
				</div>

				{/* Progress indicator */}
				<div className="mb-8">
					<div className="flex justify-center items-center space-x-2 mb-4">
						<div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce"></div>
						<div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce animation-delay-200"></div>
						<div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce animation-delay-400"></div>
					</div>
					<p className="text-gray-400 text-sm">开发进行中 • Development in Progress</p>
				</div>

				{/* Contact/Notify section */}
				<div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10 max-w-md mx-auto">
					<p className="text-gray-300 mb-4">想要获取最新进展？</p>
					<p className="text-gray-400 text-sm">Want to get the latest updates?</p>
					<div className="mt-4 flex justify-center">
						<div 
							onClick={handleDemoClick}
							className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-6 py-2 rounded-full font-medium hover:from-orange-600 hover:to-pink-600 transition-all duration-300 cursor-pointer hover:scale-105 transform"
						>
							查看数据库
						</div>
					</div>
				</div>

				{/* Visitor Stats */}
				<div className="mt-8 max-w-md mx-auto">
					<VisitorStats onViewDetails={handleViewDetails} />
				</div>
			</div>

			{/* Visitor Details Modal */}
			<VisitorDetailsModal 
				isOpen={isModalOpen} 
				onClose={() => setIsModalOpen(false)} 
			/>

		</div>
	);
}
