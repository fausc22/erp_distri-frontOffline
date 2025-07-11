import AppHeader from './AppHeader';



const DefaultLayout = ({ children }) => {
	return (
		<>
			
			<AppHeader />
			<div>{children}</div>
			
		</>
	);
};

export default DefaultLayout;
