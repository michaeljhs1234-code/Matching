import { z } from 'zod'

export const signUpSchema = z.object({
  name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
  student_id: z
    .string()
    .regex(/^\d{10}$/, '학번은 10자리 숫자여야 합니다'),
  department_id: z
    .number()
    .int()
    .positive('학과를 선택해주세요'),
  email: z
    .string()
    .email('올바른 이메일 형식이 아닙니다'),
  password: z
    .string()
    .min(6, '비밀번호는 6자 이상이어야 합니다'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '비밀번호가 일치하지 않습니다',
  path: ['confirmPassword'],
})

export const loginSchema = z.object({
  email: z.string().email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export type SignUpFormData = z.infer<typeof signUpSchema>
export type LoginFormData = z.infer<typeof loginSchema>
