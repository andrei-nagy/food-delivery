import React, { useState, useEffect } from 'react';
import { Dropdown, Form as SemanticForm, Button as SemanticButton } from 'semantic-ui-react';
import { motion } from "framer-motion";


// Lista de cursuri
const COURSES = {
  core: [
    "javascripting", "git-it", "Scope Chains & Closures", "Elementary Electron", "learnyounode",
    "How to npm", "stream-adventure", "how-to-markdown"
  ],
  electives: [
    "Functional Javascript", "ExpressWorks", "Make Me Hapi", "Promise It Won't Hurt", "Async You"
  ],
};

// Componenta pentru selectarea departamentului și a cursului
const CourseSelect = ({ department, course, onChange }) => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    if (department) {
      setCourses(COURSES[department] || []);
    }
  }, [department]);

  return (
    <>
      <div className="field">
        <label>Department</label>
        <Dropdown
          placeholder="Which department?"
          fluid
          selection
          options={[
            { text: "NodeSchool: Core", value: "core" },
            { text: "NodeSchool: Electives", value: "electives" },
          ]}
          value={department || ''}
          onChange={(e, { value }) => onChange('department', value)}
        />
      </div>
      {courses.length > 0 && (
        <div className="field">
          <label>Course</label>
          <Dropdown
            placeholder="Which course?"
            fluid
            selection
            options={courses.map((courseOption) => ({
              text: courseOption,
              value: courseOption,
            }))}
            value={course || ''}
            onChange={(e, { value }) => onChange('course', value)}
          />
        </div>
      )}
    </>
  );
};

// Componenta principală de formular
const FormComponent = () => {
  const [people, setPeople] = useState([{ name: 'potato', email: 'potato@person.com', department: 'core', course: 'javascripting' }]);
  const [fields, setFields] = useState({ name: '', email: '', department: '', course: '' });
  const [fieldErrors, setFieldErrors] = useState({});

  const onInputChange = (name, value) => {
    setFields({ ...fields, [name]: value });
    // if (name === 'email' && !validator.isEmail(value)) {
    //   setFieldErrors({ ...fieldErrors, [name]: 'Invalid Email' });
    // } else {
    //   setFieldErrors({ ...fieldErrors, [name]: '' });
    // }
  };

  const validate = () => {
    const errMessages = Object.keys(fieldErrors).filter(k => fieldErrors[k]);
    return !fields.name || !fields.email || !fields.course || !fields.department || errMessages.length;
  };

  const onFormSubmit = (evt) => {
    evt.preventDefault();
    if (validate()) return;
    setPeople([...people, fields]);
    setFields({ name: '', email: '', department: '', course: '' });
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-100 mb-4">Sign Up Sheet</h2>
      <SemanticForm onSubmit={onFormSubmit}>
        <div className="field">
          <label>Name</label>
          <input
            placeholder="Name"
            value={fields.name}
            onChange={(e) => onInputChange('name', e.target.value)}
          />
        </div>
        <div className="field">
          <label>Email</label>
          <input
            placeholder="Email"
            value={fields.email}
            onChange={(e) => onInputChange('email', e.target.value)}
          />
          {fieldErrors.email && <div className="text-red-500">{fieldErrors.email}</div>}
        </div>
        <CourseSelect
          department={fields.department}
          course={fields.course}
          onChange={onInputChange}
        />
        <SemanticButton type="submit" disabled={validate()}>Submit Form</SemanticButton>
      </SemanticForm>
      <hr className="my-4" />
      <h3 className="text-lg font-semibold text-gray-100 mb-4">People</h3>
      <ul>
        {people.map((person, i) => (
          <li key={i}>
            {person.name} - {person.email} - {person.department} - {person.course}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Integrarea formularului în componenta SubmitTicketPage
const SubmitTicketPage = () => {
  return (
    <motion.div
      className='max-w-7xl mt-10 mx-auto py-6 px-4 lg:px-8 bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className='flex justify-between items-center mb-6'>
        <h2 className='text-xl font-semibold text-gray-100'>Customization page</h2>
      </div>
      <div className='overflow-x-auto'>
        <FormComponent />
      </div>
    </motion.div>
  );
};

export default SubmitTicketPage;
