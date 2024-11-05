import React from "react";
import { Col, Container, Row } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {
	faCamera,
	faCannabis,
	faRandom,
} from "@fortawesome/free-solid-svg-icons";

const features = [
	{
		icon: faCannabis,
		title: "Thousands of Options",
		desc: "Bearing bearing form night spirit, for signs isn't, tree fourth i there two wow fill with fixed fro in land deep man without seasons fill itself.",
	},
	{
		icon: faCannabis,
		title: "Design with Love",
		desc: "Moving seasons, tree you're creeping third behold may be. Whose living for moving female seas heaven cattle seed unto winged.",
	},
	{
		icon: faRandom,
		title: "Pick the type of banking.",
		desc: "Banks likewise put away cash to develop their hold of cash. What they do is directed by laws. Those laws vary in various nations.",
	},
	{
		icon: faRandom,
		title: "Pick the type of banking.",
		desc: "Under saying our appear Second their heaven created shall darkness him great kind open creature Deep open had i above.",
	},
	{
		icon: faCamera,
		title: "Easy to Customize",
		desc: "Male also herb fish gathered is. Without thing. Him divided gathering there rule. Us. Creepeth. Over evening gathered. Living be.",
	},
	{
		icon: faCamera,
		title: "Get your documentation",
		desc: "Man our from light they're cattle upon created female. You first land evening beast won't for it had bring first void meat.",
	},
];

const FeatureItem = ({ feature }) => {
	return (
		<div className="d-flex ezy__featured23-item position-relative p-3 p-md-4 mb-3 mb-lg-4">
			<div className="ezy__featured23-icon mb-4 me-4">
				<FontAwesomeIcon icon={feature.icon} />
			</div>
			<div>
				<h4 className="ezy__featured23-title fs-4 mb-3">{feature.title}</h4>
				<p className="ezy__featured23-content mb-0">{feature.desc}</p>
			</div>
		</div>
	);
};

FeatureItem.propTypes = {
	feature: PropTypes.object.isRequired,
};

const AdminFeatures = () => {
	return (
		<section className="ezy__featured23 light">
			<Container>
				<Row className="mb-5 text-center justify-content-center">
					<Col lg={7}>
						<h2 className="ezy__featured23-heading mb-4">Our Features</h2>
						<p className="ezy__featured23-sub-heading mb-4">
							Assumenda non repellendus distinctio nihil dicta sapiente,
							quibusdam maiores, illum at, aliquid blanditiis eligendi qui.
						</p>
					</Col>
				</Row>
				<Row className="pt-md-5">
					<Col lg={4} className="mb-4 mb-lg-0 order-lg-2">
						<div className="ezy__featured23-shape">
							<div
								className="ezy__featured23-bg-holder h-100"
								style={{
									backgroundImage:
										"url(https://cdn.easyfrontend.com/pictures/featured/featured_9.png)",
								}}
							/>
						</div>
					</Col>
					<Col lg={8}>
						<div className="ms-xl-4">
							<Row>
								{features.map((feature, i) => (
									<Col xs={12} lg={6} key={i}>
										<FeatureItem feature={feature} />
									</Col>
								))}
							</Row>
						</div>
					</Col>
				</Row>
			</Container>
		</section>
	);
};

export default AdminFeatures