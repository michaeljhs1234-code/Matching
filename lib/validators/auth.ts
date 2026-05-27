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
    .email('올바른 이메일 형식이 아닙니다')
    .endsWith('@chungbuk.ac.kr', '충북대학교 이메일(@chungbuk.ac.kr)만 사용 가능합니다'),
  password: z
    .string()
    .min(8, '비밀번호는 8자 이상이어야 합니다')
    .regex(/[A-Za-z]/, '영문자를 포함해야 합니다')
    .regex(/[0-9]/, '숫자를 포함해야 합니다')
    .regex(/[^A-Za-z0-9]/, '특수문자를 포함해야 합니다'),
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
