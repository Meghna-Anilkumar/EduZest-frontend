import { useState } from "react";

interface FormErrors {
    [key: string]: string;
}

interface ValidationRules {
    [key: string]: (value: string) => string | null;
}

interface UseFormProps {
    initialValues: { [key: string]: string };
    validationRules?: ValidationRules;
    onSubmit: (values: { [key: string]: string }) => void;
}

export const useForm = ({ initialValues, validationRules, onSubmit }: UseFormProps) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const validate = () => {
        const validationErrors: FormErrors = {};
        if (validationRules) {
            for (const field in values) {
                const error = validationRules[field]?.(values[field]);
                if (error) validationErrors[field] = error;
            }
        }
        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        if (validationRules?.[name]) {
            setErrors((prev) => ({ ...prev, [name]: validationRules[name](value) || "" }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            setIsSubmitting(true);
            onSubmit(values);
            setIsSubmitting(false);
        }
    };

    return {
        values,
        errors,
        isSubmitting,
        handleChange,
        handleSubmit,
    };
};
